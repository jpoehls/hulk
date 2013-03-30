var path = require('path');
var fm = require('front-matter');
var mkdirp = require('mkdirp');
var fs = require('fs');
var _ = require('underscore');
var marked = require('marked');
var template = require('./template');

// Set default markdown conversions options.
marked.setOptions({
    gfm       : true,
    tables    : true,
    breaks    : false,
    pedantic  : false,
    sanitize  : true,
    smartLists: true,
    langPrefix: 'language-'/*,
     highlight: function(code, lang) {
     if (lang === 'js') {
     return highlighter.javascript(code);
     }
     return code;
     }*/
});

function isMarkdownFile(filePath) {
    return /^\.(md|markdown)$/i.test(path.extname(filePath));
}

var Page = function (site, filePath, content) {
    this.filePath = filePath;
    this.site = site;

    var parsedContent = fm(content);
    this._originalFrontMatter = parsedContent.attributes;
    this.templateData = _.clone(this._originalFrontMatter);

    this.content = parsedContent.body;

    this.published = true;
    if (typeof this.templateData.published === 'boolean') {
        this.published = this.templateData.published;
    }

    this.layout = this.templateData.layout;
    if (this._originalFrontMatter.url) {
        this.url = this.templateData.url = this._originalFrontMatter.url;
    }
    else {
        this.url = this.templateData.url = path.relative(site.source, filePath);
    }
};

var p = Page.prototype;

p.render = function (layouts, siteTemplateData, callback) {
    var err;
    try {
        var page = this;

        var data = {
            site: siteTemplateData,
            page: page.templateData
        };

        var pageHtml = page.content;
        if (isMarkdownFile(page.filePath)) {
            pageHtml = marked(template.render(page.content, data));
        }

        var layout = layouts[page.layout];
        if (layout) {
            page.content = layout.render(pageHtml, data);
        }
        else {
            page.content = template.render(pageHtml, data);
        }
    }
    catch (err2) {
        console.log('Error rendering page: ' + page.filePath);
        err = err2;
    }
    callback(err);
};

p.destination = function (destPath) {

    // Add 'index.html' to the URL if needed.
    var url = this.url;
    if (!path.extname(url)) {
        url = path.join(url, 'index.html');
    }

    return path.join(this.site.source, path.join(destPath, url));
};

p.write = function (destination, callback) {
    var destPath = this.destination(destination);
    var page = this;
    mkdirp(path.dirname(destPath), function (err) {
        if (err) {
            callback(err);
        }
        else {
            fs.writeFile(destPath, page.content, 'utf8', function (err) {
                callback(err);
            });
        }
    });
};

module.exports = Page;