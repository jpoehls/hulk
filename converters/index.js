var _ = require('underscore');

// Import all known converters.
// Converters do 2 things, convert from X format to HTML, and replace tokens in the source
// content using the given collection of variables (i.e. basic templating).
// Each converter must export a specific interface.
/*
 {
 supports: function(page) => boolean
 render: function(content, templateData) => rendered output
 }
 */
var converters = [
    require('./html'),
    require('./jade'),
    require('./markdown')
];

// Export a single function that returns the first converter
// that supports the given page.
module.exports = {
    getConverter: function (page) {
        return _.find(converters, function (converter) {
            return converter.supports(page);
        });
    },

    default: require('./html')
}