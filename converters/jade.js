var _ = require('underscore');
var jade = require('jade');
var path = require('path');

templateHelpers = require('../templateHelpers.js');

module.exports = {
    // Gets true or false whether the given page is supported by this converter.
    supports: function(page) {
        return /^\.(jade)$/i.test(path.extname(page.filePath));
    },

    render: function(content, data) {

        var fn = jade.compile(content, {
            pretty: true
        });

        // Render the content and return the output.
        var output = fn(_.extend(data, templateHelpers));
        return output;
    }
};