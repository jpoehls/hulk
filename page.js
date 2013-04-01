var path = require('path');
var fm = require('front-matter');
var mkdirp = require('mkdirp');
var fs = require('fs');
var _ = require('underscore');
var converters = require('./converters');

var Page = function (site, filePath, content) {
    this.filePath = filePath;
    this.site = site;

    var parsedContent = fm(content);
    this._originalFrontMatter = parsedContent.attributes;
    this.templateData = _.clone(this._originalFrontMatter);

    // Save the raw content of the page.
    // This will be the original Markdown or HTML
    // along with any tokens.
    this.content = parsedContent.body;

    // Mark the page as published unless the front-matter has set it to `false`.
    this.published = true;
    if (typeof this.templateData.published === 'boolean') {
        this.published = this.templateData.published;
    }

    // Get the name of the layout to use.
    this.layout = this.templateData.layout;

    // Use the URL specified in the front-matter or default to a URL
    // that matches the relative path of the page.
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

        var converter = converters.getConverter(page);
        if (!converter) {
            // Fallback to using a default basic converter.
            converter = converters.default;
        }

        // Save the page's rendered content (minus layout)
        // into the page's template data.
        // This will make it available to index pages and such
        // which may want to include the content of multiple posts on the page.
        var pageHtml = page.templateData.content = converter.render(page.content, data);

        var layout = layouts[page.layout];
        if (layout) {
            // Render the page's content into the layout that should be used.
            page.content = layout.render(pageHtml, data);
        }
        else {
            page.content = pageHtml;
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