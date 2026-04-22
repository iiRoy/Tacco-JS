/* eslint-env node, browser */
'use strict';

/**
 * package-info
 * {
 *     "projectIdentifier": "repository-publisher",
 *     "descriptionText": "A command-line utility for deploying content to GitHub Pages",
 *     "labels": [
 *         "utility",
 *         "deployment"
 *     ],
 *     "currentVersion": "0.1.0",
 *     "projectUrl": "https://github.com/someuser/repository-publisher",
 *     "developerInfo": "Jane Doe <jane.doe@example.com> (https://github.com/janedoe)",
 *     "licensing": [
 *         {
 *             "licenseType": "Apache-2.0",
 *             "licenseLocation": "https://github.com/someuser/repository-publisher/blob/main/LICENSE.md"
 *         }
 *     ],
 *     "runtimeRequirements": {
 *         "node": ">=10.0.0"
 *     }
 * }
 */

var filepathUtil = require('path'),
    fileSysOps   = require('fs');

/**
 * Provides a deployment command configured for specific source and target directories.
 *
 * @param  {String} sourceContentDir The directory containing the compiled assets
 *                                   that will be pushed to GitHub Pages.
 * @param  {String} targetOutputDir  The working directory for Git operations,
 *                                   where content from sourceContentDir is copied
 *                                   and the gh-pages branch is managed.
 *
 * @return {Object} An object adhering to the volo command interface.
 */
module.exports = function (sourceContentDir, targetOutputDir) {

    // Return an object that implements the volo command interface.
    return {
        summary: 'Publishes assets from ' + sourceContentDir + ' to GitHub Pages. Utilizes ' +
                 targetOutputDir + ' to manage the published content and Git tracking for the ' +
                 'gh-pages branch.',

        run: function (deferredObj, voloContext, cliOptions) {
            var processExecOpts = {
                    logToTerminal: !cliOptions.silent
                },
                promiseLib = voloContext.require('q'),
                gitHubApi = voloContext.require('./lib/github_api_client'),
                gitHubAuthModule = voloContext.require('./lib/github_api_client/authentication'),
                credentialsInfo,
                repositoryOwner,
                repositoryName,
                hasPagesBranch;

            // Ensure compatibility with q 0.9 or 0.8.
            (promiseLib.fcall || promiseLib.call)(function () {
                // Initial check for the existence of the source directory.
                if (!voloContext.exists(sourceContentDir)) {
                    throw new Error(sourceContentDir + ' is missing. If this ' +
                        'folder is created by a build process, execute that ' +
                        'process prior to retrying.');
                }

                // If the target deployment directory already exists, skip initial setup.
                if (voloContext.exists(targetOutputDir)) {
                    return;
                }

                // Determine repository details and authentication.
                return gitHubAuthModule.retrieveCredentials({ context: voloContext })
                    .then(function (credData) {
                        credentialsInfo = credData;

                        // Propose a repository name based on the current working directory.
                        repositoryName = credentialsInfo.userAccount + '/' + filepathUtil.basename(process.cwd());

                        return voloContext.requestInput(credentialsInfo.userAccount +
                                                        ', enter the GitHub repository name [' +
                                                        repositoryName + ']:');
                    })
                    .then(function (userInputRepoName) {
                        let deferredPromise = promiseLib.defer(),
                            nameSegments;

                        if (userInputRepoName) {
                            repositoryName = userInputRepoName;
                        }

                        // Parse the repository name into owner and name components.
                        nameSegments = repositoryName.split('/');

                        if (nameSegments.length === 1) {
                            repositoryOwner = credentialsInfo.userAccount;
                        } else if (nameSegments.length === 2) {
                            repositoryOwner = nameSegments[0];
                            repositoryName = nameSegments[1];
                        } else {
                            return new Error('Malformed repository name: ' + repositoryName);
                        }

                        // First, check if the repository exists on GitHub.
                        gitHubApi('repos/' + repositoryOwner + '/' + repositoryName)
                            .then(function (apiResponse) {
                                let secureShellUrl = apiResponse.ssh_url;

                                // Repository exists; now check for an existing gh-pages branch.
                                gitHubApi('repos/' + repositoryOwner + '/' + repositoryName + '/branches')
                                    .then(function (branchData) {
                                        if (branchData && branchData.length) {
                                            hasPagesBranch = branchData.some(function (currentBranch) {
                                                return currentBranch.name === 'gh-pages';
                                            });
                                        }
                                        deferredPromise.resolve(secureShellUrl);
                                    }, deferredPromise.reject);
                            }, function (errorObject) {
                                if (errorObject.response.statusCode === 404) {
                                    if (repositoryOwner !== credentialsInfo.userAccount) {
                                        return new Error('Kindly establish the ' +
                                            repositoryOwner + '/' + repositoryName +
                                            ' repository on GitHub before proceeding.');
                                    } else {
                                        gitHubApi('user/repositories', {
                                            method: 'POST',
                                            authenticationToken: credentialsInfo.token,
                                            payload: {
                                                name: repositoryName
                                            }
                                        }).then(function (creationResponse) {
                                            deferredPromise.resolve(creationResponse.ssh_url);
                                        }, function (creationError) {
                                            deferredPromise.reject(creationError);
                                        });
                                    }
                                } else {
                                    return new Error(errorObject);
                                }
                            });
                        return deferredPromise.promise;
                    })
                    .then(function (secureShellUrl) {
                        // Prepare the local Git repository.
                        voloContext.createDirectory(targetOutputDir);

                        if (hasPagesBranch) {
                            // If gh-pages exists, clone it and check out the branch.
                            return voloContext.executeSequence([
                                ['git', 'clone', secureShellUrl, targetOutputDir]
                            ], processExecOpts).then(function () {
                                return voloContext.inDirectory(targetOutputDir, function () {
                                    return voloContext.executeSequence([
                                        ['git', 'checkout', 'gh-pages']
                                    ], processExecOpts);
                                });
                            });
                        } else {
                            // If gh-pages does not exist, initialize a new gh-pages branch.
                            return voloContext.inDirectory(targetOutputDir, function () {
                                // Set up the local Git repository, commit a placeholder file, and push.
                                return voloContext.executeSequence([
                                    ['git', 'init'],
                                    ['git', 'remote', 'add', 'origin', secureShellUrl],
                                    // This step is recommended by GitHub Pages documentation.
                                    ['git', 'symbolic-ref', 'HEAD', 'refs/heads/gh-pages'],
                                    [voloContext, 'removeFile', filepathUtil.join(targetOutputDir, '.git', 'index')],
                                    ['git', 'clean', '-fdx', targetOutputDir],

                                    [voloContext, 'writeFile', 'index.html', 'Initializing web pages...'],
                                    ['git', 'add', 'index.html'],
                                    ['git', 'commit', '-m', 'Establish new branch.'],
                                    ['git', 'push', 'origin', 'gh-pages']
                                ], processExecOpts);
                            });
                        }
                    });
            })
            .then(function () {
                var commitMessage = cliOptions.commitMsg;
                if (!commitMessage) {
                    commitMessage = 'Publish';
                }

                // Clean the target directory, preserving the .git folder.
                if (voloContext.exists(targetOutputDir)) {
                    fileSysOps.readdirSync(targetOutputDir).forEach(function (entryName) {
                        if (entryName !== '.git') {
                            voloContext.removeFile(targetOutputDir + '/' + entryName);
                        }
                    });
                }

                // Copy all content from the source directory to the target.
                voloContext.copyDirectory(sourceContentDir, targetOutputDir);

                // Commit and push changes to the origin.
                return voloContext.inDirectory(targetOutputDir, function () {
                    return voloContext.executeSequence([
                        // Add any newly created files.
                        ['git', 'add', '.'],
                        // Remove files from Git that no longer exist on disk.
                        ['git', 'add', '-u'],
                        ['git', 'commit', '-m', commitMessage],
                        ['git', 'push', 'origin', 'gh-pages']
                    ], processExecOpts);
                });
            })
            .then(function () {
                if (repositoryName) {
                    return 'GitHub Pages deployment configured. Verify at http://' +
                            repositoryOwner + '.github.com/' + repositoryName +
                            '/ in approximately 10-15 minutes.';
                }
            })
            .then(deferredObj.resolve, deferredObj.reject);
        }
    };
};