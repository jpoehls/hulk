var Site = require('./site');
var cfg = require('./config');
var path = require('path');
var program = require('commander');
var pjson = require('./package.json');
var util = require('util');
var _ = require('underscore');
var util = require('util');

// todo: factor out the page markdown support like we did for template engines, so we can support textile, etc in the future
// todo: support Jade pages (in addition to layouts)
// todo: replace the cleanup method with a simple dump of the destination folder
// todo: add support for includes (load from config.includes folder), Jade only
// todo: add support for plugins. first plugin being a sitemap content plugin.
// todo: test on windows and see if URLs use the correct forward-slashes
// todo: support plugins that can provide extra functions to templates (such as as cleanDescription() function) - should be installable via NPM peer dependencies
// todo: factor out the layout and page template engines so that we can use Jade for layouts/static pages and mustache/ejs? for tokens in posts/pages
// todo: unit tests?
// todo: change --server to serve a dynamic version of the site that will reflect changs live without regeneration
// todo: eventually support pygments for syntax highlighting

// Plugin types:
// - content (plugin can create files, such as an atom.xml feed or sitemap.xml file)
// - template helper functions?

module.exports = cli;

// Export a function that hulk-cli will call to run hulk.
function cli() {

    program
        .version(pjson.version)
        .option('--server [port]', 'Start web server (default port 4000)', parseInt)
        .option('--url [url]', 'Set custom site.url')
        .parse(process.argv);

    // Gets a timestamp for use in console log output.
    function timestamp() {
        var d = new Date();

        function pad(input) {
            input = '' + input;
            while (input.length < 2) {
                input = '0' + input;
            }
            return input;
        }

        return util.format(
            '%s-%s-%s %s:%s:%s',
            d.getFullYear(),
            pad(d.getMonth() + 1),
            pad(d.getDay()),
            pad(d.getHours()),
            pad(d.getMinutes()),
            pad(d.getSeconds()));
    }

    // Gets the port number to serve on.
    function getPort() {
        var port = 4000;
        if (program.server && typeof program.server === 'number') {
            port = program.server;
        }
        return port;
    }

    var serverStarted = false;

    // Starts the static file web server for the destination directory.
    function startServer(site, config) {
        if (!serverStarted) {

            var port = getPort();

            var static = require('node-static');
            var file = new (static.Server)(path.join(site.source, config.destination));
            require('http').createServer(function (request, response) {
                request.addListener('end', function () {
                    file.serve(request, response);
                });
            }).listen(port);

            console.log('Serving on port %d', port);
            serverStarted = true;
        }
    }

    cfg.read(function (err, config) {

        if (program.url) {
            config.url = program.url;
        }

        var site = new Site(config);
        var dest = path.join(site.source, config.destination);

        site.on('processed', function (args) {
            if (program.server) {
                startServer(site, config);
            }

            console.log('Successfully generated site: %s -> %s', site.source, dest);
        });

        console.log('Building site: %s -> %s', site.source, dest);
        site.process();

    });
}