var _ = require('underscore');
var path = require('path');

// Make underscore template similar to mustache for aesthetics.
_.templateSettings = _.defaults({
    interpolate: /\{\{\{([^\{\}]+)\}\}\}/g, // {{{ ... }}}
    escape     : /\{\{([^\{\}]+)\}\}/g // {{ ... }}
}, _.templateSettings);

templateHelpers = require('../templateHelpers.js');

module.exports = {
    // Gets true or false whether the given layout is supported by this engine.
    supports: function(layout) {
        return /^\.(htm|html)$/i.test(path.extname(layout.filePath));
    },

    compile: function(template) {
      return _.template(template);
    },

    render: function(template, data) {

        // If template isn't already compiled, compile it.
        if (typeof template !== 'function') {
            template = this.compile(template);
        }

        // Render the template and return the output.
        var output = template(_.extend(data, templateHelpers));
        return output;
    }
};