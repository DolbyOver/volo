/**
 * @license Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/volojs/volo for details
 */

/*jslint */
/*global define, console, process */

define(function (require, exports, module) {
    'use strict';

    var fs = require('fs'),
        path = require('path'),
        q = require('q'),
        tempDir = require('volo/tempDir'),
        archive = require('volo/archive'),
        file = require('volo/file'),
        download = require('volo/download'),
        unzip = require('volo/unzip'),
        volofile = require('volo/volofile'),
        create;

    create = {
        summary: 'Creates a new web project.',

        doc: require('text!./create/doc.md'),

        validate: function (namedArgs, appName) {
            if (!appName || !(/^[A-Za-z\d\-]+$/.test(appName))) {
                return new Error('appName can only contain alphanumeric and dash characters.');
            } else if (path.existsSync(appName)) {
                return new Error(appName + ' already exists.');
            }
            return undefined;
        },

        run: function (d, v, namedArgs, appName, template) {
            template = template || 'volojs/create-template';

            var archiveInfo, tempDirName, zipFileName;

            //Function used to clean up in case of errors.
            function errCleanUp(err) {
                if (tempDirName) {
                    //Clean up temp area. Even though this is async,
                    //it is not important to track the completion.
                    file.asyncPlatformRm(tempDirName);
                }
                return err;
            }

            //Find out how to get the template
            q.call(function () {
                return archive.resolve(template, namedArgs.volo.resolve);
            })
            //Create a tempdir to store the archive.
            .then(function (info) {
                archiveInfo = info;
                return tempDir.create(template);
            })
            .then(function (tempName) {
                //Save the name for the outer errCleanUp to use later.
                tempDirName = tempName;
                zipFileName = path.join(tempDirName, 'template.zip');

                return download(archiveInfo.url, zipFileName);
            }).then(function () {
                if (archiveInfo.isArchive) {
                    return unzip(zipFileName);
                }
                return undefined;
            }).then(function () {
                //Move the unzipped directory to the final location.
                var dirName = file.firstDir(tempDirName);
                if (dirName) {
                    //Move the unpacked template to appName
                    fs.renameSync(dirName, appName);

                    return file.asyncPlatformRm(tempDirName);
                } else {
                    return errCleanUp(new Error('Unexpected zipball configuration'));
                }
            }).then(function () {
                //If there is a volofile with an onCreate, run it.
                return volofile.run(appName, 'onCreate', namedArgs, appName);
            }).then(function (commandOutput) {
                return (commandOutput || '') +
                        archiveInfo.url + ' used to create ' + appName;
            })
            .then(d.resolve, function (err) {
                errCleanUp(err);
                d.reject(err);
            });
        }
    };

    return require('volo/commands').register(module.id, create);
});
