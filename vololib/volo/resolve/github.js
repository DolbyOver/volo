/**
 * @license Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/volojs/volo for details
 */

define(function (require) {
    'use strict';

    var path = require('path'),
        config = require('../config'),
        archive = require('../archive'),
        github = require('../github');

    function resolveGithub(archiveName, fragment, callback, errback) {

        var parts = archiveName.split('/'),
            originalFragment = fragment,
            ownerPlusRepo, version, localName, override;

        localName = parts[1];

        ownerPlusRepo = parts[0] + '/'  + parts[1];
        version = parts[2];

        override = config.github.overrides[ownerPlusRepo];

        //Fetch the latest version
        github.latestTag(ownerPlusRepo + (version ? '/' + version : ''))
            .then(function (tag) {
                var isArchive = true,
                    isSingleFile = false,
                    scheme = 'github',
                    url;

                //If there is a specific override to finding the file,
                //for instance jQuery releases are put on a CDN and are not
                //committed to github, use the override.
                if (fragment || (override && override.pattern)) {
                    //If a specific file in the repo. Do not need the full
                    //zipball, just use a raw github url to get it.
                    if (fragment) {
                        url = github.rawUrl(ownerPlusRepo, tag, fragment);
                        //Adjust local name to be the fragment name.
                        localName = path.basename(fragment);
                        //Strip off extension name.
                        localName = localName.substring(0, localName.lastIndexOf('.'));
                    } else {
                        //An override situation.
                        url = override.pattern.replace(/\{version\}/, tag);
                    }

                    //Set fragment to null since it has already been processed.
                    fragment = null;
                    isSingleFile = true;

                    isArchive = archive.isArchive(url);
                } else {
                    url = github.zipballUrl(ownerPlusRepo, tag);
                }

                return {
                    id: scheme + ':' + ownerPlusRepo + '/' + tag +
                             (originalFragment ? '#' + originalFragment : ''),
                    scheme: scheme,
                    url: url,
                    isArchive: isArchive,
                    isSingleFile: isSingleFile,
                    fragment: fragment,
                    localName: localName
                };
            })
            .then(callback, errback);
    }

    return resolveGithub;
});
