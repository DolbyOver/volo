/**
 * @license Copyright (c) 2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/volojs/volo for details
 */

/*jslint regexp: true */
/*global define, console */

define(function (require) {
    'use strict';
    var q = require('q'),
        urlLib = require('url'),
        https = require('https'),
        http = require('http'),
        net;

    return (net = {
        getJson: function (url) {
            var d = q.defer(),
                args = urlLib.parse(url),
                lib = args.protocol === 'https:' ? https : http;

            lib.get(args, function (response) {
                var body = '';

                response.on('data', function (data) {
                    body += data;
                });

                response.on('end', function () {
                    if (response.statusCode === 404) {
                        d.reject(args.host + args.path + ' does not exist');
                    } else if (response.statusCode === 200) {
                        //Convert the response into an object
                        d.resolve(JSON.parse(body));
                    } else {
                        d.reject(args.host + args.path + ' returned status: ' +
                                 response.statusCode + '. ' + body);
                    }
                });
            }).on('error', function (e) {
                d.reject(e);
            });

            return d.promise;
        }
    });
});
