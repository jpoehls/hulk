var _ = require('underscore');
var S = require('string');
var moment = require('moment');
var util = require('util');

// Make underscore template similar to mustache for aesthetics.
_.templateSettings = _.defaults({
    interpolate: /\{\{\{([^\{\}]+)\}\}\}/g, // {{{ ... }}}
    escape     : /\{\{([^\{\}]+)\}\}/g // {{ ... }}
}, _.templateSettings);

// Helpers functions to be made available in templates.
templateHelpers = {
    formatDate        : function (date, format) {
        return moment(date).format(format);
    },
    collapseWhitespace: function (input) {
        return S(input).collapseWhitespace().s;
    },
    truncate          : function (input, length) {
        return S(input).truncate(length).s;
    },
    stripHtml         : function (input) {
        return S(input).stripTags().s;
    },
    inspect           : function (input) {
        return util.inspect(input);
    }
};

module.exports = {
    compile: function(template) {
        return _.template(template);
    },

    render: function(template, data) {
        if (typeof template !== 'function') {
            template = _.template(template);
        }

        var output = template(_.extend(data, templateHelpers));
        return output;
    }
};