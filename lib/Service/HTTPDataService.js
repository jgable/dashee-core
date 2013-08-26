
var http = require('http'),
    url = require('url');

var _ = require('lodash');

var IntervalService = require("./IntervalService");

function HTTPServiceConstructor(dashee, config) {
    IntervalService.call(this, dashee, _.defaults(config, HTTPService.DEFAULTS));
}

var HTTPService = IntervalService.extend({
    
    constructor: HTTPServiceConstructor,

    getData: function (done) {
        var self = this;

        this.makeWebRequest(function (err, response, contents) {
            if (err) { return done(err); }

            var result = self.parseRequestContents(response, contents);

            done(null, result);
        });
    },

    makeWebRequest: function (done) {
        if (!this.config.url) {
            return done(new Error("Must provide a url in the configuration"));
        }

        var self = this,
            parsedUrl = url.parse(this.config.url),
            request = http.request({
                method: this.config.method,
                hostname: parsedUrl.hostname,
                port: parsedUrl.port,
                path: parsedUrl.path
            }, function (res) {
                res.setEncoding(self.config.encoding);
                
                var responseData = "";
                res.on("data", function (chunk) {
                    responseData += chunk;
                });
                res.on("end", function () {
                    done(null, res, responseData);
                });
            });

        if (this.config.data) {
            if (_.isString(this.config.data)) {
                request.write(this.config.data);
            } else {
                request.write(JSON.stringify(this.config.data));
            }
        }

        request.on('error', function(err) {
            return done(err);
        });

        request.end();
    },

    parseRequestContents: function (response, contents) {
        if (_.isString(contents)) {
            try {
                contents = JSON.parse(contents);
            } catch(e) {
                console.warn("Error trying to parse request contents:", contents);
            }
        }

        return contents;
    }
});

HTTPService.DEFAULTS = {
    method: "GET",
    encoding: 'utf8'
};

module.exports = HTTPService;