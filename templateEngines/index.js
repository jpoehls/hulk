var _ = require('underscore');

// Import all known template engines.
// Each engine must export a specific interface.
/*
 {
 supports: function(layout) => boolean
 compile: function(templateContent) => compiled template function
 render: function(templateContent|compiledTemplateFunction, templateData) => rendered output
 }
 */
var engines = [
    require('./underscore')
];

// Export a single function that returns the first template engine
// that supports the given layout.
module.exports = {
    getLayoutEngine: function (layout) {
        return _.find(engines, function (engine) {
            return engine.supports(layout);
        });
    }
}