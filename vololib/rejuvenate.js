/**
 * @license Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/volojs/volo for details
 */

/*global define, console, process */

define(function (require, exports, module) {
    'use strict';

    var q = require('q'),
        fs = require('fs'),
        path = require('path'),
        add = require('add'),
        baseUrl = require('volo/baseUrl'),
        config = require('volo/config').command.rejuvenate,
        rejuvenate;

    rejuvenate = {
        summary: 'Updates volo to latest version.',

        doc: require('text!./rejuvenate/doc.md'),

        flags: add.flags,

        validate: function (namedArgs) {},

        run: function (deferred, v, namedArgs, from) {
            //Create a 'vololib' directory as a sibling to the volo file
            var dirName = path.dirname(baseUrl),
                baseName = path.basename(process.argv[1]),
                cwd = process.cwd(),
                d = q.defer(),
                voloFileMode = fs.statSync(path.join(dirName, baseName)).mode;

            from = from || config.archive;

            //Change directory to the one holding volo
            process.chdir(dirName);

            function finish() {
                process.chdir(cwd);
            }

            //Set force: true in namedArgs so that add will do the
            //work even though volo exists.
            namedArgs.force = true;

            add.run(d, v, namedArgs, from, baseName);

            q.when(d.promise, function (result) {
                finish();
                fs.chmodSync(baseName, voloFileMode);
                deferred.resolve(result + '\n' + baseName + ' has been updated!');
            }, function (err) {
                finish();
                deferred.reject(err);
            });
        }
    };

    return require('volo/commands').register(module.id, rejuvenate);
});
