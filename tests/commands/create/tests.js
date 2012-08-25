/*jslint node: true */
/*global doh, voloLib */
'use strict';

var q = require('q'),
    main = require(voloLib + '/../volo'),
    start = q.defer(),
    fs = require('fs'),
    path = require('path'),
    file = require(voloLib + '/file'),
    cwd = process.cwd(),
    dir = __dirname,
    testDir = path.join(dir, 'output'),
    end;

//Clean up old test output, create a fresh directory for it.
end = start.promise.then(function () {
    return file.rm(testDir);
})
.then(function () {
    fs.mkdirSync(testDir);
    process.chdir(testDir);
})
.then(function () {
    return main(['create', 'simple', '../support/simple'], function (result) {
        console.log(result);
        doh.register("createSimple",
            [
                function createSimple(t) {
                    t.is(true, file.exists(path.join('simple', 'simple.js')));
                }
            ]
        );
        doh.run();
    });
})
.then(function () {
    return main(['create', 'dude', '../support/hasOnCreate', 'name=fred', 'code=blue'],
        function (result) {
        console.log(result);
        doh.register("createHasOnCreate",
            [
                function createHasOnCreate(t) {
                    var outputPath = path.join('dude', 'output.txt');
                    t.is(true, file.exists(outputPath));
                    t.is(false, file.exists(path.join('dude', 'volofile')));
                    t.is(false, file.exists(path.join('dude', 'sample.template')));
                    t.is('Hello fred. Your code is blue', fs.readFileSync(outputPath, 'utf8'));
                }
            ]
        );
        doh.run();
    });
})

//Test running npm before running onCreate: #68
.then(function () {
    return main(['create', 'dude2', '../support/hasNpmInstall'],
        function (result) {
        console.log(result);
        doh.register("createHasNpmInstall",
            [
                function createHasNpmInstall(t) {
                    var outputPath = path.join('dude2', 'ok.txt');
                    t.is(true, file.exists(outputPath));
                    t.is('ok', fs.readFileSync(outputPath, 'utf8'));
                }
            ]
        );
        doh.run();
    });
})

//Make sure something that looks like a .git directory but is really not
//gets copied over correctly: #68
.then(function () {
    return main(['create', 'funny', '../support/funnySubDirName'],
        function (result) {
        console.log(result);
        doh.register("createFunnySubDirName",
            [
                function createFunnySubDirName(t) {
                    var outputPath = path.join('funny', 'README.md');
                    t.is(true, file.exists(outputPath));
                    outputPath = path.join('funny', 'something.github.com', 'test.txt');
                    t.is(true, file.exists(outputPath));
                    t.is('success', fs.readFileSync(outputPath, 'utf8'));
                }
            ]
        );
        doh.run();
    });
})

.then(function (result) {
    process.chdir(cwd);
});

module.exports = {
    start: start,
    end: end
};
