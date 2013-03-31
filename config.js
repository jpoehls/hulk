var fs = require('fs');
var path = require('path');
var yaml = require('yaml-js');
var _ = require('underscore');

// read config
var defaults = {
    source     : process.cwd(),
    destination: '_site',
    layouts    : '_layouts',
    includes   : '_includes',
    posts      : '_posts',
    permalink  : '/{{year}}/{{month}}/{{day}}/{{slug}}.html',
    ignore     : [
        'node_modules/**',
        'package.json',
        '**/.*', // dot files
        '.*/**' // dot files
    ]
};

function ignoreSpecialFolders(config) {
    var ignores = [
        config.destination
    ];

    for (var i = 0; i < ignores.length; i++) {
        config.ignore.push(path.join(ignores[i], '**'));
    }
}

function readConfig(callback) {
    var configPath = path.join(process.cwd(), '_config.yml');
    console.log('Configuration from %s', configPath);

    fs.readFile(configPath, 'utf8', function (err, data) {
        if (err) {
            callback(err);
            return;
        }

        var config = yaml.load(data);

        // Override the default configuration values with the site's config.
        config = _.defaults(config, defaults);

        // Merge the config file's ignore list with our default ignores.
        // Unlike other configuration options the user can't override
        // our defaults, only append to them.
        config.ignore = _.union(config.ignore, defaults.ignore);

        // Trim trailing forward-slash from the URL.
        // This is only applicable to relative URLs of course.
        // All page and post URLs will begin with a forward-slash
        // and this prevents doubling up.
        config.url = config.url.replace(/\/$/, '');

        // Ignore some special folders set in the configuration.
        ignoreSpecialFolders(config);

        callback(null, config);
    });
}

module.exports = {
    read: readConfig
};