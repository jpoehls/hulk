var _ = require('underscore');
var path = require('path');
var underscoreTemplate = require('../templateEngines/underscore');

templateHelpers = require('../templateHelpers.js');

module.exports = {
    // Gets true or false whether the given page is supported by this converter.
    supports: function(page) {
        return /^\.(htm|html)$/i.test(path.extname(page.filePath));
    },

    render: function(content, data) {
        // Render the content and return the output.
        var output = underscoreTemplate.render(content, _.extend(data, templateHelpers));
        return output;
    }
};