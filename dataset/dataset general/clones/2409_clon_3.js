/*jslint node: true */
'use strict';

/**
 * @typedef {Object} CommandContext
 * @property {object} deferred A Q-style deferred object for async operations.
 * @property {object} utilities A collection of utility functions (like fs, git commands).
 * @property {object} cliOptions Command line arguments provided by the user.
 */

// Core Node.js utility modules for file system and path manipulation
const fileUtil = require('path');
const diskOps = require('fs');

/**
 * Provides a specialized command utility for managing GitHub Pages deployments.
 * This function configures the deployment process using specified source and target directories.
 *
 * @param {string} sourceContentPath - The directory containing the build artifacts ready for deployment.
 * @param {string} deploymentTargetDir - The local directory used to manage the 'gh-pages' branch.
 * @returns {object} An object conforming to the Volo command API, including a summary and an execution method.
 */
module.exports = function (sourceContentPath, deploymentTargetDir) {

    // Helper to log messages based on verbosity settings
    const logMessage = (utilSet, message, level = 'info') => {
        if (utilSet.log && !utilSet.cliOptions.quiet) {
            if (level === 'error') utilSet.log.error(message);
            else if (level === 'warn') utilSet.log.warn(message);
            else utilSet.log.info(message);
        }
    };

    // Return the command definition object
    return {
        briefDescription: `Orchestrates deployment of content from '${sourceContentPath}' to GitHub Pages. ` +
                          `Utilizes '${deploymentTargetDir}' as a staging area for the 'gh-pages' branch.`,

        /**
         * Executes the GitHub Pages deployment task.
         * @param {object} deferred - A Q-style deferred object for managing asynchronous flow.
         * @param {object} utilities - An object providing various utility functions (e.g., file system, process execution, prompt).
         * @param {object} cliOptions - Command-line arguments passed to the script.
         */
        executeTask: function (deferred, utilities, cliOptions) {
            const processExecutionOpts = {
                useConsole: !cliOptions.quiet // Redirect output to console unless quiet mode is active
            };

            // Acquire necessary external modules via the utilities object
            const promisify = utilities.require('q'); // Promise library
            const repoApiGateway = utilities.require('./lib/github'); // GitHub API interaction
            const authProvider = utilities.require('./lib/github/auth'); // GitHub authentication module

            let currentCredentials;
            let projectOwnerName;
            let repositoryIdentifier;
            let branchExistsOnRemote = false; // Flag to indicate if 'gh-pages' branch already exists on GitHub

            // Current working directory for context
            const currentWorkingPath = process.cwd();

            logMessage(utilities, 'Initiating GitHub Pages deployment process...');

            // Start a promise chain to manage the asynchronous steps
            (promisify.fcall || promisify.call)(function () {
                // Ensure the source directory for deployment content exists
                if (!utilities.exists(sourceContentPath)) {
                    const errorMessage = `Source content directory '${sourceContentPath}' not found. ` +
                                         `Please ensure your build command has executed successfully before deployment.`;
                    logMessage(utilities, errorMessage, 'error');
                    throw new Error(errorMessage);
                }

                // If the deployment target directory already exists, it implies an existing local gh-pages repo.
                // We'll skip the initial git setup and proceed directly to content synchronization.
                if (utilities.exists(deploymentTargetDir)) {
                    logMessage(utilities, `Deployment staging directory '${deploymentTargetDir}' already exists. ` +
                                          `Assuming an initialized repository; proceeding to content update.`);
                    return promisify.resolve(); // Resolve immediately to skip to content deployment
                }

                logMessage(utilities, 'Fetching GitHub authentication details...');

                // Obtain GitHub authentication information from the user's environment
                return authProvider.fetch({ v: utilities })
                    .then(function (authPayload) {
                        currentCredentials = authPayload; // Store authentication details

                        // Suggest a repository name based on the authenticated user and current directory
                        repositoryIdentifier = `${currentCredentials.user}/${fileUtil.basename(currentWorkingPath)}`;
                        logMessage(utilities, `Suggested repository name: ${repositoryIdentifier}`);

                        // Prompt the user to confirm or modify the suggested repository name
                        return utilities.prompt(`${currentCredentials.user}, please confirm or provide the GitHub repository name (e.g., 'owner/repo-name') ` +
                                                `[${repositoryIdentifier}]:`);
                    })
                    .then(function (userProvidedRepoName) {
                        const setupPromise = promisify.defer(); // Deferred for managing this specific setup step

                        // Use the user-provided name if available, otherwise stick with the suggestion
                        if (userProvidedRepoName && userProvidedRepoName.trim().length > 0) {
                            repositoryIdentifier = userProvidedRepoName.trim();
                        }

                        // Parse the repository identifier into owner and name components
                        const repoSegments = repositoryIdentifier.split('/');

                        if (repoSegments.length === 1) {
                            // If only one segment, assume it's the repository name under the authenticated user
                            projectOwnerName = currentCredentials.user;
                            repositoryIdentifier = repoSegments[0];
                        } else if (repoSegments.length === 2) {
                            // If two segments, assume 'owner/repo-name' format
                            projectOwnerName = repoSegments[0];
                            repositoryIdentifier = repoSegments[1];
                        } else {
                            // Invalid format for repository name
                            const invalidRepoError = `Invalid GitHub repository identifier format: '${repositoryIdentifier}'. ` +
                                                     `Expected 'repo-name' or 'owner/repo-name'.`;
                            logMessage(utilities, invalidRepoError, 'error');
                            throw new Error(invalidRepoError);
                        }

                        logMessage(utilities, `Attempting to locate or create repository: ${projectOwnerName}/${repositoryIdentifier}`);

                        // First, check if the specified GitHub repository already exists
                        repoApiGateway(`repos/${projectOwnerName}/${repositoryIdentifier}`)
                            .then(function (repoDetails) {
                                const repoSshLink = repoDetails.ssh_url;
                                logMessage(utilities, `Repository '${projectOwnerName}/${repositoryIdentifier}' found.`);

                                // If the repo exists, check if it already has a 'gh-pages' branch
                                return repoApiGateway(`repos/${projectOwnerName}/${repositoryIdentifier}/branches`)
                                    .then(function (branchList) {
                                        if (branchList && Array.isArray(branchList)) {
                                            branchExistsOnRemote = branchList.some(gitBranch => gitBranch.name === 'gh-pages');
                                            logMessage(utilities, `Remote 'gh-pages' branch status: ${branchExistsOnRemote ? 'exists' : 'does not exist'}.`);
                                        }
                                        setupPromise.resolve(repoSshLink); // Resolve with the SSH URL
                                    })
                                    .catch(setupPromise.reject); // Propagate branch check errors
                            }, function (apiError) {
                                // Handle cases where the repository does not exist (404)
                                if (apiError.response && apiError.response.statusCode === 404) {
                                    logMessage(utilities, `Repository '${projectOwnerName}/${repositoryIdentifier}' not found on GitHub.`, 'warn');
                                    // If the intended owner is not the authenticated user, we cannot create it
                                    if (projectOwnerName !== currentCredentials.user) {
                                        const creationError = `Repository '${projectOwnerName}/${repositoryIdentifier}' does not exist. ` +
                                                              `Please create it manually on GitHub before proceeding, as you are not the owner.`;
                                        logMessage(utilities, creationError, 'error');
                                        throw new Error(creationError);
                                    } else {
                                        // If owner is the authenticated user, attempt to create the repository
                                        logMessage(utilities, `Creating new repository: ${projectOwnerName}/${repositoryIdentifier}`);
                                        repoApiGateway('user/repos', {
                                            method: 'POST',
                                            token: currentCredentials.token,
                                            content: {
                                                name: repositoryIdentifier,
                                                description: `GitHub Pages for ${repositoryIdentifier}`,
                                                homepage: `https://${projectOwnerName}.github.io/${repositoryIdentifier}/`,
                                                private: false, // GitHub Pages typically requires public repos
                                                has_issues: false,
                                                has_projects: false,
                                                has_wiki: false
                                            }
                                        }).then(function (creationDetails) {
                                            logMessage(utilities, `Repository '${repositoryIdentifier}' created successfully.`);
                                            setupPromise.resolve(creationDetails.ssh_url);
                                        }, function (creationIssue) {
                                            logMessage(utilities, `Failed to create repository: ${creationIssue.message}`, 'error');
                                            setupPromise.reject(creationIssue); // Propagate creation errors
                                        });
                                    }
                                } else {
                                    logMessage(utilities, `An unexpected error occurred while checking repository existence: ${apiError.message}`, 'error');
                                    setupPromise.reject(apiError); // Propagate other API errors
                                }
                            });
                        return setupPromise.promise;
                    })
                    .then(function (repoSshLink) {
                        // Ensure the deployment target directory exists locally
                        utilities.mkdir(deploymentTargetDir);
                        logMessage(utilities, `Deployment target directory '${deploymentTargetDir}' ensured.`);

                        if (branchExistsOnRemote) {
                            logMessage(utilities, `Remote 'gh-pages' branch detected. Cloning existing repository...`);
                            // If 'gh-pages' exists remotely, clone the entire repo and switch to that branch
                            return utilities.sequence([
                                ['git', 'clone', repoSshLink, deploymentTargetDir]
                            ], processExecutionOpts).then(function () {
                                return utilities.withDir(deploymentTargetDir, function () {
                                    logMessage(utilities, `Checking out 'gh-pages' branch locally.`);
                                    return utilities.sequence([
                                        ['git', 'checkout', 'gh-pages']
                                    ], processExecutionOpts);
                                });
                            });
                        } else {
                            logMessage(utilities, `No remote 'gh-pages' branch found. Initializing new branch locally...`);
                            // If no 'gh-pages' branch exists, initialize a new git repository in the target directory
                            // and set up 'gh-pages' as the primary branch.
                            return utilities.withDir(deploymentTargetDir, function () {
                                const initialBranchSetupCommands = [
                                    ['git', 'init'],
                                    ['git', 'remote', 'add', 'origin', repoSshLink],
                                    // This command sets 'gh-pages' as the default branch for this repository
                                    ['git', 'symbolic-ref', 'HEAD', 'refs/heads/gh-pages'],
                                    // Remove any existing index to prepare for a clean gh-pages branch
                                    // Using -r --cached . is more robust than removing a specific index file
                                    ['git', 'rm', '-r', '--cached', '.'],
                                    // Clean up untracked files and directories
                                    ['git', 'clean', '-fdx'],
                                    // Add a placeholder index.html file to create the initial commit on gh-pages
                                    [utilities, 'write', 'index.html', 'Setting up GitHub Pages branch...'],
                                    ['git', 'add', 'index.html'],
                                    ['git', 'commit', '-m', 'Initial commit for gh-pages branch setup.'],
                                    // Push the newly created gh-pages branch to the remote origin
                                    ['git', 'push', 'origin', 'gh-pages']
                                ];
                                logMessage(utilities, `Executing initial git setup for 'gh-pages' branch.`);
                                return utilities.sequence(initialBranchSetupCommands, processExecutionOpts);
                            });
                        }
                    });
            })
            .then(function () {
                let commitMessageText = cliOptions.m;
                if (!commitMessageText) {
                    commitMessageText = 'Automated GitHub Pages deployment via custom utility.';
                }
                logMessage(utilities, `Deployment commit message: "${commitMessageText}"`);

                // Clean up the deployment target directory before copying new content
                // This ensures old files are removed, but preserves the .git directory
                if (utilities.exists(deploymentTargetDir)) {
                    logMessage(utilities, `Cleaning up old content in '${deploymentTargetDir}' (excluding .git folder).`);
                    diskOps.readdirSync(deploymentTargetDir).forEach(function (entryName) {
                        if (entryName !== '.git') {
                            const fullPath = fileUtil.join(deploymentTargetDir, entryName);
                            logMessage(utilities, `Removing old deployment artifact: ${fullPath}`, 'debug');
                            utilities.rm(fullPath);
                        }
                    });
                }

                // Copy the latest build artifacts from the source to the deployment target directory
                logMessage(utilities, `Copying content from '${sourceContentPath}' to '${deploymentTargetDir}'.`);
                utilities.copyDir(sourceContentPath, deploymentTargetDir);

                // Commit the changes and push to the 'gh-pages' branch
                return utilities.withDir(deploymentTargetDir, function () {
                    logMessage(utilities, `Committing and pushing updates from '${deploymentTargetDir}' to 'gh-pages'.`);
                    return utilities.sequence([
                        // Add all new and modified files
                        ['git', 'add', '.'],
                        // Stage deletions of files that no longer exist in the source directory
                        ['git', 'add', '-u'],
                        ['git', 'commit', '-m', commitMessageText],
                        ['git', 'push', 'origin', 'gh-pages']
                    ], processExecutionOpts);
                });
            })
            .then(function () {
                if (repositoryIdentifier && projectOwnerName) {
                    const ghPagesUrl = `https://${projectOwnerName}.github.io/${repositoryIdentifier}/`;
                    logMessage(utilities, `Deployment to GitHub Pages complete! Your site should be available at: ${ghPagesUrl} ` +
                                          `Please allow a few minutes for GitHub to process the deployment.`);
                    return ghPagesUrl;
                } else {
                    logMessage(utilities, 'Deployment completed, but repository information is missing to construct a URL.', 'warn');
                    return 'Deployment finished without a specific URL.';
                }
            })
            .then(deferred.resolve) // Resolve the main deferred object on success
            .catch(function (issue) {
                logMessage(utilities, `Deployment failed due to an error: ${issue.message || issue}`, 'error');
                deferred.reject(issue); // Reject the main deferred object on any error
            });
        }
    };
};