/**
 * @license Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/volojs/volo for details
 */

'use strict';
/*jslint plusplus: false */
/*global define */

define(function (require) {
    var baseUrl = require('./baseUrl'),
        fs = require('fs'),
        path = require('path'),
        jsExtRegExp = /\.js$/,
        registry = {},
        commands;

    commands = {
        register: function (id, value) {
            //Only take the first part of the ID
            id = id.split('/')[0];

            registry[id] = value;
            return value;
        },

        have: function (name) {
            var hasCommand = name && registry.hasOwnProperty(name);
            if (!hasCommand) {
                //See if it is available on disk
                hasCommand = path.existsSync(path.join(baseUrl, name + '.js'));
            }

            return hasCommand;
        },

        list: function (callback) {
            var ids = [];

            if (path.existsSync(baseUrl)) {
                ids = fs.readdirSync(baseUrl);
                ids = ids.filter(function (filePath) {
                    return filePath.charAt(0) !== '.' && jsExtRegExp.test(filePath);
                }).map(function (filePath) {
                    return filePath.substring(0, filePath.length - 3);
                });
            }

            require(ids, function () {
                //All commands are loaded, list them out.
                var message = '',
                    ids, i;

                ids = Object.keys(registry);
                ids.sort();

                for (i = 0; i < ids.length; i++) {
                    message += ids[i] + ': ' + require(ids[i]).summary + '\n\n';
                }

                callback(message);
            });
        }
    };

    return commands;
});
