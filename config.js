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

function ignoreSiteFolders(config) {
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
        config = _.defaults(config, defaults);
        config.ignore = _.union(config.ignore, defaults.ignore);

        // Trim trailing forward-slash from the URL.
        // All page and post URLs will begin with a forward-slash
        // and this prevents doubling up.
        config.url = config.url.replace(/\/$/, '');

        ignoreSiteFolders(config);

        callback(null, config);
    });
}

module.exports = {
    read: readConfig
};