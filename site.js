var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var iterateFiles = require('iterate-files');
var Layout = require('./layout');
var Post = require('./post');
var Page = require('./page');
var StaticFile = require('./staticFile');
var minimatch = require('minimatch');
var debug = require('debug')('duckgen:site');

var Site = function (config) {
    this.config = config;
    this.source = this.config.source;
    this.permalink = this.config.permalink;

    this.reset();
};

util.inherits(Site, EventEmitter);

var p = Site.prototype;

// Read, process, and write this Site to output.
p.process = function () {

    var site = this;
    site.reset();

    debug('reading');
    site.read(function () {

        debug('rendering');
        site.render(function () {

            debug('cleaning');
            site.cleanup(function () {

                debug('writing');
                site.write(function () {

                    var totalFiles = site.posts.length + site.pages.length + site.staticFiles.length;

                    debug('generated %d files', totalFiles);
                    site.emit('processed', {
                        filesChanged: totalFiles
                    });
                })
            })
        })
    });
};

// Reset Site details.
p.reset = function () {
    this.layouts = {};
    this.posts = [];
    this.pages = [];
    this.staticFiles = [];

    this.templateData = _.defaults({
        time : new Date(),
        url: this.config.url,
        posts: [],
        pages: []
    }, this.config.global);
};

// Read Site data from disk and load it into internal data structures.
p.read = function (callback) {

    var queue = 0,
        site = this,
        queueLoaded = false;

    function dequeue() {
        queue--;
        if (queueLoaded && queue === 0) {

            // Sort posts into reverse chronological order.
            site.posts.sort(function (a, b) {
                if (a.date > b.date)
                    return -1;
                if (a.date < b.date)
                    return 1;
                return 0;
            });

            // Add posts and pages to the site template data.
            site.templateData.posts = _.pluck(site.posts, 'templateData');
            site.templateData.pages = _.pluck(site.pages, 'templateData');

            callback();
        }
    }

    iterateFiles(
        site.source,
        function (filePath) {

            var relativePath = path.relative(site.source, filePath);

            // Skip ignored files.
            if (site.isIgnored(filePath)) {
                //debug('Ignored:', relativePath);
                return;
            }

            if (site.isLayout(filePath)) {
                queue++;

                var layoutName = path.basename(filePath, path.extname(filePath));
                //debug('Layout:', relativePath);

                fs.readFile(filePath, 'utf8', function (err, data) {
                    if (err) {
                        site.emit('error', err);
                        return;
                    }

                    site.layouts[layoutName] = new Layout(site, data);

                    dequeue();
                });
            }
            else if (site.isPost(filePath)) {
                if (!Post.isValid(filePath)) {
                    return;
                }

                queue++;

                //debug('Post:', relativePath);

                fs.readFile(filePath, 'utf8', function (err, data) {
                    if (err) {
                        site.emit('error', err);
                        return;
                    }

                    var post = new Post(site, filePath, data);
                    if (post.published) {
                        site.posts.push(post);
                    }

                    dequeue();
                });
            }
            else {
                queue++;

                var reader = fs.createReadStream(filePath, {
                    encoding: 'utf8'
                });

                var isPage = false;
                var pageContent = '';

                reader.on('data', function (data) {
                    // Check for front-matter to determine if
                    // this is a page or static file.
                    if (data.substr(0, 3) === '---') {
                        //debug('Page:', relativePath);
                        isPage = true;
                        pageContent += data;
                    }
                    else {
                        reader.destroy();

                        //debug('Static File:', relativePath);
                        site.staticFiles.push(new StaticFile(site, filePath));

                        dequeue();
                    }
                });

                reader.on('end', function () {
                    if (isPage) {
                        var page = new Page(site, filePath, pageContent);
                        if (page.published) {
                            site.pages.push(page);
                        }
                    }

                    dequeue();
                });
            }

        },
        function (err) {
            if (err) {
                site.emit('error', err);
            }

            // Force the dequeue logic to run at least once
            // incase there aren't any posts or pages.
            queueLoaded = true;
            queue++;
            dequeue();
        });

};

// Returns true or false whether the given file should be ignored.
p.isIgnored = function (filePath) {
    var relativePath = path.relative(this.source, filePath);

    var ignoreList = this.config.ignore;
    for (var i = 0; i < ignoreList.length; i++) {
        var pattern = ignoreList[i];
        if (minimatch(relativePath, pattern, {
            dot      : true,
            nocomment: true
        })) {
            return true;
        }
    }

    return false;
};

// Returns true or false whether the given file is in the layout folder.
p.isLayout = function (filePath) {
    var relativePath = path.relative(this.source, filePath);
    var layoutGlob = path.join(this.config.layouts, '**');
    return minimatch(relativePath, layoutGlob, {
        dot      : true,
        nocomment: true
    });
};

// Returns true or false whether the given file is in the posts folder.
p.isPost = function (filePath) {
    var relativePath = path.relative(this.source, filePath);
    var postsGlob = path.join(this.config.posts, '**');
    return minimatch(relativePath, postsGlob, {
        dot      : true,
        nocomment: true
    });
};

// Render the posts and pages.
p.render = function (callback) {
    var queue = 0,
        site = this,
        queueLoaded = false;

    function dequeue(err) {
        if (err) {
            site.emit('error', err);
        }

        queue--;
        if (queueLoaded && queue === 0) {
            callback();
        }
    }

    var i;

    for (i = 0; i < site.posts.length; i++) {
        queue++;
        site.posts[i].render(site.layouts, site.templateData, dequeue);
    }
    for (i = 0; i < site.pages.length; i++) {
        queue++;
        site.pages[i].render(site.layouts, site.templateData, dequeue);
    }

    // Force the dequeue logic to run at least once
    // incase there aren't any posts or pages.
    queueLoaded = true;
    queue++;
    dequeue();
};

p.cleanup = function (callback) {
    // todo: remove orphaned files (files not in pages, posts, or staticFiles) and empty directories in destination
    callback();
};

// Write the posts, pages, and static files to the destination folder.
p.write = function (callback) {
    var queue = 0,
        site = this,
        queueLoaded = false;

    function dequeue(err) {
        if (err) {
            site.emit('error', err);
        }

        queue--;
        if (queueLoaded && queue === 0) {
            callback();
        }
    }

    var i;

    for (i = 0; i < site.posts.length; i++) {
        queue++;
        site.posts[i].write(site.config.destination, dequeue);
    }
    for (i = 0; i < site.pages.length; i++) {
        queue++;
        site.pages[i].write(site.config.destination, dequeue);
    }
    for (i = 0; i < this.staticFiles.length; i++) {
        queue++;
        site.staticFiles[i].write(site.config.destination, dequeue);
    }

    // Force the dequeue logic to run at least once
    // incase there aren't any posts or pages.
    queueLoaded = true;
    queue++;
    dequeue();
};

module.exports = Site;