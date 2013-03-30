var path = require('path');
var fm = require('front-matter');
var _ = require('underscore');
var moment = require('moment');
var Page = require('./page');
var util = require('util');

// Valid post file name regex.
var MATCHER = /^(\d{4})-(\d{1,2})-(\d{1,2})-(.*)(\.[^.]+)$/

function parseSlug(filePath) {
    var m = MATCHER.exec(path.basename(filePath));
    return m[4].toLowerCase();
}

function parseDate(filePath) {
    var m = MATCHER.exec(path.basename(filePath));
    var year = Number(m[1]);
    var month = Number(m[2]) - 1;
    var day = Number(m[3]);

    return new Date(year, month, day);
}

function getUrlFromPermalink(post) {
    var url = post.permalink
        // {{year}} -> ex. 2013
        .replace(/\{\{\s*year\s*\}\}/gi, post.date.getFullYear())
        // {{month}} -> ex. 2
        .replace(/\{\{\s*month\s*\}\}/gi, post.date.getMonth() + 1)
        // {{day}} -> ex. 20
        .replace(/\{\{\s*day\s*\}\}/gi, post.date.getDay())
        // {{title}} -> ex. title-of-post
        .replace(/\{\{\s*title\s*\}\}/gi, post.slug);

    return url;
}

var Post = function (site, filePath, content) {
    Page.call(this, site, filePath, content);

    this.slug = parseSlug(filePath);
    this.url = this.templateData.url;
    this.permalink = site.permalink;

    this.date = this.date = parseDate(filePath);
    if (this.templateData.date) {
        if (_.isDate(this.templateData.date)) {
            this.date = this.templateData.date;
        }
        else {
            // Parse the front-matter date as an ISO-8601 string.
            this.date = moment(this.templateData.date);
        }
    }

    // Transform a space delimited category list into an array.
    if (typeof this.templateData.categories === 'string') {
        this.templateData.categories = _.filter(this.templateData.categories.split(/\s+/), function (category) {
            // Remove empty items from the array.
            return !!category;
        });
    }

    // If a specific URL was specified in the front-matter then use that.
    if (this._originalFrontMatter.url) {
        this.templateData.url = this.url = this._originalFrontMatter.url;
    }
    else {
        // Else build a URL from the permalink template.
        this.templateData.url = this.url = getUrlFromPermalink(this);
    }
    // Ensure the URL has a trailing slash if it doesn't end in a file.
    if (!path.extname(this.url)) {
        this.templateData.url = this.url = path.join(this.url, '/');
    }
};

util.inherits(Post, Page);

var p = Post.prototype;

p.destination = function (destPath) {

    // Add 'index.html' to the URL if needed.
    var url = this.url;
    if (!path.extname(url)) {
        url = path.join(url, 'index.html');
    }

    return path.join(this.site.source, path.join(destPath, url));
};

// Post name validator. Post file names must be like:
// 2008-11-05-my-awesome-post.markdown
Post.isValid = function (fileName) {
    return MATCHER.test(path.basename(fileName));
};

module.exports = Post;