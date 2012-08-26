
/*jslint node: true */
/*global define, doh */
'use strict';

var github = require(global.voloLib + '/github'),
    q = require('q'),
    start = q.defer(),
    end;

end = start.promise.then(function () {
    return github.latestTag('jquery/jquery/<1.7.0').then(function (version) {

        doh.register("githubSemVerLessThan",
            [
                function githubSemVerLessThan(t) {
                    t.is('1.6.4', version);
                }
            ]);
        doh.run();
    });
})

.then(function () {
    return github.latestTag('jrburke/requirejs/~1').then(function (version) {

        doh.register("githubSemVerMajorMinor",
            [
                function githubSemVerMajorMinor(t) {
                    t.is('1.0.8', version);
                }
            ]);
        doh.run();
    });
})

.then(function () {
    return github.latestTag('jrburke/requirejs/1.0.6').then(function (version) {

        doh.register("githubExactVersion",
            [
                function githubExactVersion(t) {
                    t.is('1.0.6', version);
                }
            ]);
        doh.run();
    });
});

module.exports = {
    start: start,
    end: end
};
