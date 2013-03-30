var path = require('path');
var fm = require('front-matter');
var _ = require('underscore');
var moment = require('moment');
var S = require('string');
var util = require('util');
var template = require('./template');

var Layout = function (site, content) {
    this.site = site;

    content = fm(content);
    this.templateData = content.attributes;
    this.content = content.body;
};

var p = Layout.prototype;

p.render = function (pageContent, data) {
    _.extend(data, {
        content: pageContent
    });

    var output = template.render(this.content, data);
    return output;
};

module.exports = Layout;