var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var util = require('util');
var _ = require('underscore');

var StaticFile = function (site, filePath) {
    this.site = site;
    this.filePath = filePath;
};

var p = StaticFile.prototype;

p.destination = function (destPath) {
    var rel = path.relative(this.site.source, this.filePath);
    return path.join(this.site.source, path.join(destPath, rel));
};

p.write = function (destination, callback) {
    var destPath = this.destination(destination);
    var filePath = this.filePath;
    mkdirp(path.dirname(destPath), function (err) {
        if (err) {
            callback(err);
        }
        else {
            copyFile(filePath, destPath, function (err) {
                callback(err);
            });
        }
    });
};

// http://stackoverflow.com/a/14387791/31308
function copyFile(source, target, callback) {
    var callbackCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", function (err) {
        done(err);
    });

    var wr = fs.createWriteStream(target);
    wr.on("error", function (err) {
        done(err);
    });
    wr.on("close", function (ex) {
        done();
    });

    rd.pipe(wr);

    function done(err) {
        if (!callbackCalled) {
            callback(err);
            callbackCalled = true;
        }
    }
}

module.exports = StaticFile;