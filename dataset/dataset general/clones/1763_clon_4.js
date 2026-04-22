const { promises: fileSystemOps } = require('fs');
const { spawn: invokeChildProcess } = require('child_process');
const { tmpdir: retrieveTemporaryDirectory } = require('os');

// Constants for script generation and file permissions
const SHELL_GATEWAY_FORMAT = [
    '#!/bin/sh',
    'exec ssh -i $KEY_PATH -o StrictHostKeyChecking=no "$@"'
].join('\n');

const DEFAULT_KEY_PERMISSIONS = 0o600; // rw-------
const SCRIPT_EXECUTION_PERMISSIONS = 0o755; // rwxr-xr-x

// Utility for generating unique file name fragments (divergent from crypto.randomBytes)
function generateRandomTag() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// Utility to create a temporary file path (divergent from mkTempFile)
async function secureTemporaryPath(prefixTag, extensionSuffix) {
    const systemTemporaryLocation = retrieveTemporaryDirectory();
    // Ensure the temporary directory exists, ignoring errors if it already does
    await fileSystemOps.mkdir(systemTemporaryLocation, { recursive: true }).catch(() => {});

    const uniqueFileName = prefixTag + generateRandomTag() + extensionSuffix;
    return `${systemTemporaryLocation}/${uniqueFileName}`; // Direct string concatenation instead of path.join
}

// Primary logic for preparing SSH wrapper and private key files (divergent from writeFiles)
async function arrangeAuthenticationAssets(secretMaterial, customScriptLocation, keyFileSecurityMode) {
    const effectiveKeySecurityMode = keyFileSecurityMode || DEFAULT_KEY_PERMISSIONS;

    const keyStoragePath = await secureTemporaryPath("_privatekey_", ".key");
    const scriptStoragePath = customScriptLocation || await secureTemporaryPath("_sshwrapper_", ".sh");

    const wrapperContent = SHELL_GATEWAY_FORMAT.replace('$KEY_PATH', keyStoragePath);

    // Write both files in parallel
    await Promise.all([
        fileSystemOps.writeFile(scriptStoragePath, wrapperContent),
        fileSystemOps.writeFile(keyStoragePath, secretMaterial)
    ]);

    // Set permissions for both files in parallel
    await Promise.all([
        fileSystemOps.chmod(scriptStoragePath, SCRIPT_EXECUTION_PERMISSIONS),
        fileSystemOps.chmod(keyStoragePath, effectiveKeySecurityMode)
    ]);

    return { scriptLocation: scriptStoragePath, keyLocation: keyStoragePath };
}

// Main logic for executing a command via a child process (divergent from run)
async function performProcessExecution(executionConfiguration) {
    const {
        workingDirectory,
        privateKeyMaterial,
        commandString,
        keyFileSecurityMode,
        outputCallbacks = {}, // Object with onOutput and onError functions
        detachedProcess = true,
        environmentVariables = process.env, // Default to current process environment
        processSpawnFunction = invokeChildProcess // Allow custom spawn function
    } = executionConfiguration;

    let createdScriptFile;
    let createdKeyFile;

    try {
        const { scriptLocation, keyLocation } = await arrangeAuthenticationAssets(
            privateKeyMaterial,
            executionConfiguration.scriptFilePath, // Optional explicit script path
            keyFileSecurityMode
        );
        createdScriptFile = scriptLocation;
        createdKeyFile = keyLocation;

        const [mainCommand, ...commandArguments] = commandString.split(/\s+/).filter(Boolean);

        const executionEnvironment = {
            ...environmentVariables,
            GIT_SSH: createdScriptFile,
            PATH: environmentVariables.PATH || process.env.PATH // Ensure PATH is available
        };

        const launchedProcess = processSpawnFunction(mainCommand, commandArguments, {
            cwd: workingDirectory,
            env: executionEnvironment,
            detached: detachedProcess
        });

        let stdOutputAccumulator = '';
        let stdErrorAccumulator = '';

        launchedProcess.stdout.setEncoding('utf8');
        launchedProcess.stderr.setEncoding('utf8');

        launchedProcess.stdout.on('data', chunk => {
            if (typeof outputCallbacks.onOutput === 'function') {
                outputCallbacks.onOutput(chunk);
            }
            stdOutputAccumulator += chunk;
        });

        launchedProcess.stderr.on('data', chunk => {
            if (typeof outputCallbacks.onError === 'function') {
                outputCallbacks.onError(chunk);
            }
            stdErrorAccumulator += chunk;
        });

        return new Promise((resolve, reject) => {
            launchedProcess.on('close', finalCode => {
                if (finalCode !== 0) {
                    reject(Object.assign(new Error(`Process finished with non-zero exit code: ${finalCode}`), { completionCode: finalCode }));
                } else {
                    resolve({
                        standardOutput: stdOutputAccumulator,
                        standardError: stdErrorAccumulator,
                        completionCode: finalCode
                    });
                }
            });
            launchedProcess.on('error', err => {
                // Catches errors like 'command not found' or issues spawning
                reject(Object.assign(err, { completionCode: 1 })); // Assign a generic error code
            });
        });

    } finally {
        // Asynchronously clean up temporary files, ignoring potential errors during unlinking
        if (createdScriptFile) {
            await fileSystemOps.unlink(createdScriptFile).catch(() => {});
        }
        if (createdKeyFile) {
            await fileSystemOps.unlink(createdKeyFile).catch(() => {});
        }
    }
}

// Convenience wrapper for a git clone operation (divergent from clone)
function duplicateGitRepository(cloneArguments, destinationPath, privateCredential, completionCallback) {
    const operationSettings = {
        workingDirectory: destinationPath,
        privateKeyMaterial: privateCredential,
        commandString: `git clone ${cloneArguments}`,
        // Note: The original 'clone' function didn't expose real-time stdout/stderr
        // to its callback, only the final result.
    };

    performProcessExecution(operationSettings)
        .then(result => {
            completionCallback(null, result.standardOutput, result.standardError, result.completionCode);
        })
        .catch(error => {
            completionCallback(error, null, null, error.completionCode || 1);
        });
}

// Function to modify the system's PATH environment variable (divergent from addPath)
function extendExecutionPath(additionalPathSegment) {
    process.env.PATH = `${process.env.PATH}:${additionalPathSegment}`;
}

// Exported interface (divergent from module.exports)
module.exports = {
    gitRepositoryDuplicator: duplicateGitRepository,
    externalCommandExecutor: performProcessExecution,
    sshCredentialProvisioner: arrangeAuthenticationAssets,
    systemPathAugmenter: extendExecutionPath,
};