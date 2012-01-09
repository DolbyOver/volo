/**
 * @license Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/volojs/volo for details
 */

'use strict';
/*jslint */
/*global define, console, process */

define(function (require) {
    var path = require('path'),
        fs = require('fs'),
        fileUtil = require('./fileUtil'),
        qutil = require('./qutil'),
        counter = 0,
        tempDir;

    tempDir = {

        create: function (seed, callback, errback) {
            var temp = tempDir.createTempName(seed),
                d = qutil.convert(callback, errback);

            if (path.existsSync(temp)) {
                fileUtil.rmdir(temp, function () {
                    fs.mkdirSync(temp);
                    d.resolve(temp);
                }, d.reject);
            } else {
                fs.mkdirSync(temp);
                d.resolve(temp);
            }

            return d.promise;
        },

        createTempName: function (seed) {
            counter += 1;
            return seed.replace(/[\/\:]/g, '-') + '-temp-' + counter;
        }
    };

    return tempDir;
});
