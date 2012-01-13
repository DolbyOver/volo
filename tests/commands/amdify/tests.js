/*jslint nomen: false */
/*global define, doh, process, console */
'use strict';

define(function (require, exports, module) {

    var q = require('q'),
        main = require('volo/main'),
        start = q.defer(),
        fs = require('fs'),
        path = require('path'),
        file = require('volo/file'),
        cwd = process.cwd(),
        dir = path.dirname(module.uri),
        supportDir = path.join(dir, 'support'),
        testDir = path.join(dir, 'output'),
        end;

    //Clean up old test output, create a fresh directory for it.
    end = start.promise.then(function () {
        if (path.existsSync(testDir)) {
            return file.rmdir(testDir);
        }
        return undefined;
    })
    .then(function () {
        file.copyDir(supportDir, testDir);
        process.chdir(testDir);
    })
    .then(function () {
        return main(['amdify', 'plain.js'], function (result) {
            console.log(result);
            doh.register("amdifyPlain",
                [
                    function amdifyPlain(t) {
                        var output = fs.readFileSync('plain.js', 'utf8'),
                            expected = fs.readFileSync('../expected/plain.js', 'utf8');

                        t.is(output, expected);
                    }
                ]
            );
            doh.run();
        });
    })
    .then(function () {
        return main(['amdify', 'plainExports.js', 'exports=baz'], function (result) {
            console.log(result);
            doh.register("amdifyPlainExports",
                [
                    function amdifyPlainExports(t) {
                        var output = fs.readFileSync('plainExports.js', 'utf8'),
                            expected = fs.readFileSync('../expected/plainExports.js', 'utf8');

                        t.is(output, expected);
                    }
                ]
            );
            doh.run();
        });
    })
    .then(function () {
        return main(['amdify', 'lib.js', 'depend=alpha,beta'], function (result) {
            console.log(result);
            doh.register("amdifyLib",
                [
                    function amdifyLib(t) {
                        var output = fs.readFileSync('lib.js', 'utf8'),
                            expected = fs.readFileSync('../expected/lib.js', 'utf8');

                        t.is(output, expected);
                    }
                ]
            );
            doh.run();
        });
    })
    .then(function () {
        return main(['amdify', 'libExports.js', 'depend=gamma', 'exports=window.libExports'], function (result) {
            console.log(result);
            doh.register("amdifyLibExports",
                [
                    function amdifyLibExports(t) {
                        var output = fs.readFileSync('libExports.js', 'utf8'),
                            expected = fs.readFileSync('../expected/libExports.js', 'utf8');

                        t.is(output, expected);
                    }
                ]
            );
            doh.run();
        });
    })
    .then(function (result) {
        process.chdir(cwd);
    });

    return {
        start: start,
        end: end
    };
});
