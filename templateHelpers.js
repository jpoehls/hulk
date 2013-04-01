var S = require('string');
var moment = require('moment');
var util = require('util');

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

module.exports = templateHelpers;