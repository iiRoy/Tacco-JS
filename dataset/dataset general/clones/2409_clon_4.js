/*jslint node: true */
'use strict';

const filesystem = require('fs/promises');
const pathIdentifier = require('path');
const { spawn: spawnUtility } = require('child_process');
const inputInterface = require('readline');
const httpsModule = require('https');

// Helper for running shell commands
async function executeSystemCommand(commandSegments, operationSettings = {}) {
    const [mainUtility, ...argumentsList] = commandSegments;
    const processHandle = spawnUtility(mainUtility, argumentsList, { stdio: operationSettings.silenceOutput ? 'ignore' : 'inherit' });

    return new Promise((completionHandler, errorHandler) => {
        processHandle.on('close', (exitCode) => {
            if (exitCode !== 0) {
                errorHandler(new Error(`Process terminated with code ${exitCode}: ${commandSegments.join(' ')}`));
            } else {
                completionHandler();
            }
        });
        processHandle.on('error', (issue) => {
            errorHandler(new Error(`Failed to initiate process ${mainUtility}: ${issue.message}`));
        });
    });
}

// Helper for interactive prompt
async function acquireUserResponse(questionPrompt) {
    const interactionAgent = inputInterface.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const responseData = await new Promise(resolver => interactionAgent.question(questionPrompt + ' ', resolver));
    interactionAgent.close();
    return responseData.trim();
}

// Helper for GitHub API calls
class RemoteCodePlatformClient {
    constructor(authenticationToken) {
        this.credentialToken = authenticationToken;
        this.apiHost = 'api.github.com';
    }

    async performApiRequest(apiEndpoint, requestOptions = {}) {
        const requestHeaders = {
            'Authorization': `token ${this.credentialToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
            ...requestOptions.additionalHeaders
        };

        const connectionParameters = {
            hostname: this.apiHost,
            path: `/${apiEndpoint}`,
            method: requestOptions.verb || 'GET',
            headers: requestHeaders
        };

        return new Promise((successCallback, failureCallback) => {
            const clientRequest = httpsModule.request(connectionParameters, (serverResponse) => {
                let receivedData = '';
                serverResponse.on('data', (chunk) => { receivedData += chunk; });
                serverResponse.on('end', () => {
                    let processedPayload;
                    try {
                        processedPayload = JSON.parse(receivedData);
                    } catch (parsingError) {
                        processedPayload = { information: receivedData.toString() };
                    }

                    if (serverResponse.statusCode >= 200 && serverResponse.statusCode < 300) {
                        successCallback(processedPayload);
                    } else {
                        const operationError = new Error(`API access failure: ${serverResponse.statusCode} ${processedPayload.information || serverResponse.statusMessage}`);
                        operationError.responseDetails = { statusCode: serverResponse.statusCode, content: processedPayload };
                        failureCallback(operationError);
                    }
                });
            });

            clientRequest.on('error', (networkError) => {
                failureCallback(new Error(`Network request error: ${networkError.message}`));
            });

            if (requestOptions.payload) {
                clientRequest.write(JSON.stringify(requestOptions.payload));
            }
            clientRequest.end();
        });
    }
}

// Helper for directory operations
async function replicateDirectoryRecursively(originPath, destinationPath) {
    await filesystem.mkdir(destinationPath, { recursive: true });
    const directoryEntries = await filesystem.readdir(originPath, { withFileTypes: true });

    for (const entryItem of directoryEntries) {
        const fullOriginPath = pathIdentifier.join(originPath, entryItem.name);
        const fullDestinationPath = pathIdentifier.join(destinationPath, entryItem.name);

        if (entryItem.isDirectory()) {
            await replicateDirectoryRecursively(fullOriginPath, fullDestinationPath);
        } else {
            await filesystem.copyFile(fullOriginPath, fullDestinationPath);
        }
    }
}

// Helper for changing directory context
async function withTemporaryCurrentDirectory(targetDirectory, actionCallback) {
    const initialDirectory = process.cwd();
    process.chdir(targetDirectory);
    try {
        return await actionCallback();
    } finally {
        process.chdir(initialDirectory);
    }
}

// Helper to check path existence
async function verifyPathExistence(testPath) {
    try {
        await filesystem.access(testPath, filesystem.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

// Main class for the deployment logic
class DeployerEngine {
    constructor(sourceContentLocation, targetRepositoryLocation) {
        this.sourceContentLocation = sourceContentLocation;
        this.targetRepositoryLocation = targetRepositoryLocation;
        this.githubCredentials = null;
        this.githubApiService = null;
        this.repositoryOwner = null;
        this.repositoryIdentifier = null;
        this.repositorySshUrl = null;
        this.ghPagesBranchPresent = false;
    }

    async retrieveGithubAccessDetails() {
        let accessKey = process.env.GITHUB_TOKEN || await acquireUserResponse('Provide your GitHub Personal Access Token (PAT):');
        if (!accessKey) {
            throw new Error('GitHub Personal Access Token is mandatory.');
        }
        this.githubCredentials = { token: accessKey, userLogin: 'unknown' };
        this.githubApiService = new RemoteCodePlatformClient(accessKey);

        try {
            const userProfile = await this.githubApiService.performApiRequest('user');
            this.githubCredentials.userLogin = userProfile.login;
        } catch (errorDetails) {
            console.error('Failed to obtain GitHub user information using the provided token. Verify your token.');
            throw errorDetails;
        }
    }

    async ascertainRepositoryInformation() {
        let suggestedRepository = `${this.githubCredentials.userLogin}/${pathIdentifier.basename(process.cwd())}`;
        let providedRepositoryName = await acquireUserResponse(`${this.githubCredentials.userLogin}, repository name on GitHub [${suggestedRepository}]:`);

        if (providedRepositoryName) {
            suggestedRepository = providedRepositoryName;
        }

        const nameSegments = suggestedRepository.split('/');
        if (nameSegments.length === 1) {
            this.repositoryOwner = this.githubCredentials.userLogin;
            this.repositoryIdentifier = nameSegments[0];
        } else if (nameSegments.length === 2) {
            this.repositoryOwner = nameSegments[0];
            this.repositoryIdentifier = nameSegments[1];
        } else {
            throw new Error(`Invalid repository name format provided: ${suggestedRepository}`);
        }
    }

    async validateOrCreateGithubRepository() {
        try {
            const repoData = await this.githubApiService.performApiRequest(`repos/${this.repositoryOwner}/${this.repositoryIdentifier}`);
            this.repositorySshUrl = repoData.ssh_url;

            const branchesListing = await this.githubApiService.performApiRequest(`repos/${this.repositoryOwner}/${this.repositoryIdentifier}/branches`);
            this.ghPagesBranchPresent = branchesListing.some(branchItem => branchItem.name === 'gh-pages');

        } catch (operationError) {
            if (operationError.responseDetails && operationError.responseDetails.statusCode === 404) {
                if (this.repositoryOwner !== this.githubCredentials.userLogin) {
                    throw new Error(`Repository ${this.repositoryOwner}/${this.repositoryIdentifier} does not exist. Create it on GitHub first.`);
                } else {
                    console.log(`Repository ${this.repositoryOwner}/${this.repositoryIdentifier} not found, proceeding to create it...`);
                    const newRepoDetails = await this.githubApiService.performApiRequest('user/repos', {
                        verb: 'POST',
                        payload: { name: this.repositoryIdentifier }
                    });
                    this.repositorySshUrl = newRepoDetails.ssh_url;
                    this.ghPagesBranchPresent = false;
                }
            } else {
                throw operationError;
            }
        }
    }

    async prepareGitDestination() {
        await filesystem.mkdir(this.targetRepositoryLocation, { recursive: true });

        if (this.ghPagesBranchPresent) {
            console.log(`Cloning existing gh-pages branch into ${this.targetRepositoryLocation}...`);
            await executeSystemCommand(['git', 'clone', this.repositorySshUrl, this.targetRepositoryLocation], { silenceOutput: true });
            await withTemporaryCurrentDirectory(this.targetRepositoryLocation, async () => {
                await executeSystemCommand(['git', 'checkout', 'gh-pages'], { silenceOutput: true });
            });
        } else {
            console.log(`Initializing new gh-pages branch in ${this.targetRepositoryLocation}...`);
            await withTemporaryCurrentDirectory(this.targetRepositoryLocation, async () => {
                await executeSystemCommand(['git', 'init'], { silenceOutput: true });
                await executeSystemCommand(['git', 'remote', 'add', 'origin', this.repositorySshUrl], { silenceOutput: true });
                await executeSystemCommand(['git', 'symbolic-ref', 'HEAD', 'refs/heads/gh-pages'], { silenceOutput: true });
                try {
                    await filesystem.rm(pathIdentifier.join('.git', 'index'));
                } catch (deletionError) { /* ignore if not present */ }
                await executeSystemCommand(['git', 'clean', '-fdx', '.'], { silenceOutput: true }); // Use '.' for current directory

                await filesystem.writeFile('index.html', 'Setting up pages...');
                await executeSystemCommand(['git', 'add', 'index.html'], { silenceOutput: true });
                await executeSystemCommand(['git', 'commit', '-m', 'Initial gh-pages branch establishment.'], { silenceOutput: true });
                await executeSystemCommand(['git', 'push', 'origin', 'gh-pages'], { silenceOutput: true });
            });
        }
    }

    async clearAndTransferContent() {
        console.log(`Clearing ${this.targetRepositoryLocation} and transferring assets from ${this.sourceContentLocation}...`);
        if (await verifyPathExistence(this.targetRepositoryLocation)) {
            const currentEntries = await filesystem.readdir(this.targetRepositoryLocation, { withFileTypes: true });
            for (const entryName of currentEntries) {
                if (entryName.name !== '.git') {
                    await filesystem.rm(pathIdentifier.join(this.targetRepositoryLocation, entryName.name), { recursive: true, force: true });
                }
            }
        }
        await replicateDirectoryRecursively(this.sourceContentLocation, this.targetRepositoryLocation);
    }

    async commitAndPublishUpdates(commitMessageText) {
        console.log('Committing and publishing changes to GitHub Pages...');
        await withTemporaryCurrentDirectory(this.targetRepositoryLocation, async () => {
            await executeSystemCommand(['git', 'add', '.'], { silenceOutput: true });
            await executeSystemCommand(['git', 'add', '-u'], { silenceOutput: true });
            await executeSystemCommand(['git', 'commit', '-m', commitMessageText], { silenceOutput: true });
            await executeSystemCommand(['git', 'push', 'origin', 'gh-pages'], { silenceOutput: true });
        });
    }

    async orchestrateDeployment(commandArguments) {
        const commitSummary = commandArguments.commitMessage || 'Deployment action';
        // const suppressConsoleOutput = commandArguments.silent; // Used within executeSystemCommand

        if (!(await verifyPathExistence(this.sourceContentLocation))) {
            throw new Error(`${this.sourceContentLocation} is not found. Please ensure your build process has completed.`);
        }

        if (!(await verifyPathExistence(this.targetRepositoryLocation))) {
            await this.retrieveGithubAccessDetails();
            await this.ascertainRepositoryInformation();
            await this.validateOrCreateGithubRepository();
            await this.prepareGitDestination();
        } else {
            // If target path exists, assume git setup is complete.
            // Still need credentials for pushing, so retrieve them.
            await this.retrieveGithubAccessDetails();
        }

        await this.clearAndTransferContent();
        await this.commitAndPublishUpdates(commitSummary);

        const finalAccessUrl = `http://${this.repositoryOwner || this.githubCredentials.userLogin}.github.io/${this.repositoryIdentifier || pathIdentifier.basename(process.cwd())}/`;
        return `GitHub Pages deployment concluded. Access it at ${finalAccessUrl} within approximately 10-15 minutes.`;
    }
}

// Exported factory function for the deployment system
module.exports = function createDeploymentFacility(sourceAssetPath, targetRepoPath) {
    const deploymentProcess = new DeployerEngine(sourceAssetPath, targetRepoPath);

    return {
        description: `Publishes resources from ${sourceAssetPath} to GitHub Pages using ${targetRepoPath} as a temporary staging area.`,
        process: async function(operationResultContainer, executionParameters) {
            try {
                const finalStatusMessage = await deploymentProcess.orchestrateDeployment({
                    silent: executionParameters.quiet,
                    commitMessage: executionParameters.m
                });
                operationResultContainer.resolve(finalStatusMessage);
            } catch (encounteredError) {
                operationResultContainer.reject(encounteredError);
            }
        }
    };
};