var _ = require('underscore');
var jade = require('jade');
var path = require('path');

templateHelpers = require('../templateHelpers.js');

module.exports = {
    // Gets true or false whether the given layout is supported by this engine.
    supports: function(layout) {
        return /^\.(jade)$/i.test(path.extname(layout.filePath));
    },

    compile: function(template, layoutFilePath) {
      return jade.compile(template, {
          filename: layoutFilePath,
          pretty: true
      });
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