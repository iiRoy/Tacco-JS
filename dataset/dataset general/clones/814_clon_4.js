'use strict';

const { promises: diskOperations } = require('fs');
const { promisify } = require('util');
const { exec: rawProcessExecution } = require('child_process');
const processExecution = promisify(rawProcessExecution);
const operatingSystemUtil = require('os');
const pathManipulation = require('path');

exports.default = function (toolingHost) {
    toolingHost.registerMultiTask('siteContentGenerator', 'Orchestrates static site content creation.', async function () {
        const taskCompletion = this.async();
        const runtimeSettings = this.options();
        const transientFilePaths = [];

        try {
            const primaryVersionIdentifier = await determineEngineVersion(toolingHost, runtimeSettings, processExecution);
            const temporaryConfigLocation = await manageEphemeralConfiguration(toolingHost, runtimeSettings, diskOperations, operatingSystemUtil, pathManipulation, transientFilePaths);
            await executeEngineBuild(toolingHost, runtimeSettings, processExecution, primaryVersionIdentifier, temporaryConfigLocation);
            taskCompletion(true);
        } catch (encounteredIssue) {
            toolingHost.log.error(encounteredIssue);
            toolingHost.fail.warn('Static site generation workflow terminated due to a critical error.');
            taskCompletion(false);
        } finally {
            for (const tempFilePath of transientFilePaths) {
                try {
                    await diskOperations.unlink(tempFilePath);
                } catch (cleanupError) {
                    toolingHost.log.warn(`Failed to remove temporary artifact: ${tempFilePath}. Error: ${cleanupError.message}`);
                }
            }
        }
    });
};

async function determineEngineVersion(toolingHost, runtimeSettings, processExecution) {
    const versionCheckCommand = runtimeSettings.bundleExec ? 'bundle exec jekyll -v' : 'jekyll -v';
    try {
        const { stdout: commandOutput } = await processExecution(versionCheckCommand);
        const versionMatch = commandOutput.match(/\d+/);
        if (!versionMatch) {
            throw new Error('Could not parse Jekyll version from output.');
        }
        return parseInt(versionMatch[0], 10);
    } catch (versionError) {
        toolingHost.log.error(versionError);
        throw new Error('Jekyll installation not detected. Please ensure Jekyll is installed and accessible.');
    }
}

async function manageEphemeralConfiguration(toolingHost, runtimeSettings, diskOperations, operatingSystemUtil, pathManipulation, transientFilePaths) {
    if (!runtimeSettings.raw) {
        return undefined;
    }

    const uniqueId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const tempDirectory = operatingSystemUtil.tmpdir();
    const tempFileName = `_config_${uniqueId}.yml`;
    const fullTempPath = pathManipulation.join(tempDirectory, tempFileName);

    try {
        await diskOperations.writeFile(fullTempPath, runtimeSettings.raw, 'utf8');
        transientFilePaths.push(fullTempPath); // Register for cleanup
        return fullTempPath;
    } catch (writeError) {
        toolingHost.log.error(writeError);
        throw new Error(`Failed to create temporary configuration file at ${fullTempPath}.`);
    }
}

async function executeEngineBuild(toolingHost, runtimeSettings, processExecution, primaryVersionIdentifier, temporaryConfigLocation) {
    const baseInvocation = runtimeSettings.bundleExec ? 'bundle exec jekyll' : 'jekyll';
    let subOperation = 'build';

    if (runtimeSettings.serve) {
        subOperation = primaryVersionIdentifier > 0 ? 'serve' : 'server';
    } else if (runtimeSettings.doctor) {
        subOperation = 'doctor';
    }

    const effectiveSettings = { ...runtimeSettings }; // Clone settings to avoid mutation

    if (temporaryConfigLocation) {
        effectiveSettings.config = effectiveSettings.config
            ? `${effectiveSettings.config},${temporaryConfigLocation}`
            : temporaryConfigLocation;
    }

    const commandSegments = [baseInvocation, subOperation];

    if (!effectiveSettings.doctor) {
        const cliDirectiveMapping = new Map([
            ['src', '--source'], ['dest', '--destination'], ['safe', '--safe'],
            ['plugins', '--plugins'], ['layouts', '--layouts'], ['watch', '--watch'],
            ['auto', '--watch'], ['config', '--config'], ['drafts', '--drafts'],
            ['future', '--future'], ['lsi', '--lsi'], ['limit_posts', '--limit_posts'],
            ['port', '--port'], ['server_port', '--port'], ['host', '--host'],
            ['baseurl', '--baseurl'], ['trace', '--trace'],
            // Deprecated flags handled separately
            ['paginate', null], ['permalink', null], ['markdown', null], ['url', null]
        ]);

        Array.from(cliDirectiveMapping.entries()).forEach(([settingKey, cliFlag]) => {
            if (Object.prototype.hasOwnProperty.call(effectiveSettings, settingKey) && effectiveSettings[settingKey] !== undefined) {
                if (cliFlag !== null) { // Not a deprecated flag
                    commandSegments.push(cliFlag);
                    if (typeof effectiveSettings[settingKey] !== 'boolean') {
                        commandSegments.push(String(effectiveSettings[settingKey]));
                    }
                } else { // Deprecated flag
                    toolingHost.warn(`Setting '${settingKey}' is deprecated. Consider including this in the 'raw' option or a configuration file.`);
                }
            }
        });
    }

    const finalExecutionString = commandSegments.join(' ');

    toolingHost.log.write(`Initiating: \`${finalExecutionString}\`\n`);

    if (runtimeSettings.serve) {
        toolingHost.log.write(`Jekyll web server started at http://localhost:${runtimeSettings.port || 4000}. Awaiting activity...\n`);
    }

    try {
        const { stdout: processOutput } = await processExecution(finalExecutionString);
        toolingHost.log.write(`\n\nJekyll process output:\n${processOutput}`);
    } catch (executionError) {
        toolingHost.log.write(`\n\nJekyll process output (error context):\n${executionError.stdout || ''}\n${executionError.stderr || ''}`);
        toolingHost.log.error(executionError);
        throw new Error(`Jekyll command execution failed: ${executionError.message}`);
    }
}