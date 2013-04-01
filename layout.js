var path = require('path');
var _ = require('underscore');
var moment = require('moment');
var S = require('string');
var util = require('util');
var templateEngines = require('./templateEngines');

var Layout = function (site, filePath, content) {
    this.site = site;
    this.filePath = filePath;
    this.content = content;

    this.engine = templateEngines.getLayoutEngine(this);

    this.compiled = this.engine.compile(this.content, this.filePath);
};

var p = Layout.prototype;

p.render = function (pageContent, data) {
    _.extend(data, {
        content: pageContent
    });

    var output = this.engine.render(this.compiled, data);
    return output;
};

module.exports = Layout;