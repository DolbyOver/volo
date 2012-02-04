/**
 * @license Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/volojs/volo for details
 */

'use strict';
/*jslint plusplus: false */
/*global define, voloVersion, console, process */

define(function (require) {
    var commands = require('./commands'),
        config = require('./config'),
        volofile = require('./volofile'),
        path = require('path'),
        q = require('q');

    function main(args, callback, errback) {
        var deferred = q.defer(),
            cwd = process.cwd(),
            namedArgs = {
                volo: {
                    resolve: function (relativePath) {
                        if (relativePath.indexOf('/') !== 0 &&
                            relativePath.indexOf(':') === -1) {
                            return path.resolve(cwd, relativePath);
                        }
                        return relativePath;
                    }
                }
            },
            aryArgs = [],
            flags = [],
            commandName, combinedArgs, commandOverride, firstArg;

        //Cycle through args, pulling off name=value pairs into an object.
        args.forEach(function (arg) {
            if (arg.indexOf('=') === -1) {
                //If passed a flag like -f, convert to named
                //argument based on the command's configuration.
                if (arg.indexOf('-') === 0) {
                    flags.push(arg.substring(1));
                } else {
                    //Regular array arg.
                    aryArgs.push(arg);
                }
            } else {
                var pair = arg.split('=');
                namedArgs[pair[0]] = pair[1];
            }
        });

        //The commandName will be the first arg.
        if (aryArgs.length) {
            //If first arg is a -flag or a name=value command skip it,
            //means a default volofile action should be run.
            firstArg = aryArgs[0];
            if (firstArg.indexOf('-') !== 0 && firstArg.indexOf('=') === -1) {
                commandName = aryArgs.shift();

                //If this is a specific override to bypase a volofile,
                //the next arg is the real command.
                if (commandName === 'command') {
                    commandOverride = true;
                    commandName = aryArgs.shift();
                }
            }
        }

        combinedArgs = [namedArgs].concat(aryArgs);

        //Function to run after the command object has been loaded, either
        //by a volofile or by installed volo actions.
        function runCommand(command) {
            //Really have the command. Now convert the flags into
            //named arguments.
            var hasFlagError = false;

            flags.some(function (flag) {
                if (command.flags && command.flags[flag]) {
                    namedArgs[command.flags[flag]] = true;
                } else {
                    hasFlagError = true;
                    deferred.reject('Invalid flag for ' + commandName + ': -' + flag);
                }

                return hasFlagError;
            });

            if (!hasFlagError) {
                commands.run.apply(commands, [command, null].concat(combinedArgs))
                    .then(deferred.resolve, deferred.reject);
            }
        }


        //Tries to run the command from the top, not from a local volofile.
        function runTopCommand() {
            if (commands.have(commandName)) {
                //a volo command is available, run it.
                require([commandName], runCommand);
            } else {
                //Show usage info.
                commands.list(function (message) {
                    //voloVersion set in tools/wrap.start
                    deferred.resolve(path.basename(config.volo.path) +
                                     (typeof voloVersion !== 'undefined' ?
                                        ' v' + voloVersion : '') +
                                    ', a JavaScript tool to make ' +
                                    'JavaScript projects. Allowed commands:\n\n' +
                                    message);
                });
            }
        }

        if (!commandOverride && path.existsSync(path.resolve(cwd, 'volofile'))) {
            volofile(cwd).then(function (voloMod) {
                //Set up default command name if none specified.
                commandName = commandName || 'run';

                if (voloMod.hasOwnProperty(commandName)) {
                    runCommand(voloMod[commandName]);
                } else {
                    runTopCommand();
                }
            })
            .fail(deferred.reject);
        } else {
            runTopCommand();
        }

        return q.when(deferred.promise, callback, errback);
    }

    return main;
});
