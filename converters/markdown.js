var _ = require('underscore');
var path = require('path');
var marked = require('marked');
var underscoreTemplate = require('../templateEngines/underscore');

// Set default markdown conversions options.
marked.setOptions({
    gfm       : true,
    tables    : true,
    breaks    : false,
    pedantic  : false,
    sanitize  : false,
    smartLists: true,
    langPrefix: 'language-'/*,
     highlight: function(code, lang) {
     if (lang === 'js') {
     return highlighter.javascript(code);
     }
     return code;
     }*/
});

templateHelpers = require('../templateHelpers.js');

module.exports = {
    // Gets true or false whether the given page is supported by this converter.
    supports: function(page) {
        return /^\.(md|markdown)$/i.test(path.extname(page.filePath));
    },

    render: function(content, data) {

        // Conver the markdown to html.
        content = marked(content);

        // Render the content and return the output.
        var output = underscoreTemplate.render(content, _.extend(data, templateHelpers));
        return output;
    }
};