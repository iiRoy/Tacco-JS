const secretGen = require('crypto'); // Utility for cryptographic random data generation
const EventDispatcher = require('events').EventEmitter; // Core class for event-driven programming
const fileSys = require('fs'); // Node.js file system API for file operations
const pathUtil = require('path'); // Path manipulation utilities
const systemInfo = require('os'); // Operating system specific information and utilities
const childProcessManager = require('child_process'); // Module for spawning subprocesses

// We are replacing the 'Step' dependency with native Promises for a Type III structural change.
// const AsyncFlow = require('step'); // Original dependency - functionally replaced by async/await & Promises

// Environment variable storing the execution path, allowing for dynamic modification.
let execPathEnv = process.env.PATH;

// Template for the SSH wrapper script. This script facilitates using a specific SSH private key
// for Git operations, bypassing interactive host key verification.
const sshScriptBase = `#!/bin/sh
# This script is a temporary wrapper to configure SSH for Git operations.
# It uses a specified private key file and disables strict host key checking.
exec ssh -i $KEYFILE_PATH -o StrictHostKeyChecking=no "$@"
`;

/**
 * Safely determines the system's temporary directory, ensuring its existence.
 * If the directory does not exist, an attempt is made to create it.
 * @returns {string} The absolute path to the system's temporary directory.
 */
function getSystemTempDirectory() {
    const tempDirectoryPath = systemInfo.tmpdir();
    // Verify if the temporary directory already exists.
    if (!fileSys.existsSync(tempDirectoryPath)) {
        try {
            // Attempt to create the directory, including any necessary parent directories.
            fileSys.mkdirSync(tempDirectoryPath, { recursive: true });
        } catch (creationError) {
            // Log a warning if creation fails, but do not block execution.
            // Some environments might restrict directory creation in tmpdir directly.
            console.warn(`Warning: Failed to ensure temporary directory exists at ${tempDirectoryPath}: ${creationError.message}`);
        }
    }
    return tempDirectoryPath;
}

/**
 * Generates a unique path for a temporary file within the system's designated temporary directory.
 * A random component is embedded in the filename to minimize the chance of collisions.
 * @param {string} filenamePrefix - A string to prepend to the unique filename.
 * @param {string} fileExtension - The file extension, including the dot (e.g., ".sh", ".key").
 * @returns {string} The full, absolute path to the proposed temporary file.
 * @throws {Error} If required parameters are missing.
 */
function createEphemeralFile(filenamePrefix, fileExtension) {
    // Enforce input validity for critical parameters.
    if (!filenamePrefix || !fileExtension) {
        throw new Error("Both a filename prefix and extension are mandatory for creating an ephemeral file.");
    }
    // Generate a sufficiently long random hexadecimal string for uniqueness.
    const uniqueComponent = secretGen.randomBytes(8).toString('hex'); // Increased bytes for enhanced uniqueness
    const constructedFileName = `${filenamePrefix}${uniqueComponent}${fileExtension}`;
    const fullFilePath = pathUtil.join(getSystemTempDirectory(), constructedFileName);

    return fullFilePath;
}

/**
 * Asynchronously prepares and writes the necessary SSH wrapper script and the private key content
 * to temporary files. These files are crucial for enabling Git commands to authenticate via SSH.
 *
 * @param {string} sshPrivateKeyContent - The entire content of the SSH private key.
 * @param {string|null} [wrapperScriptPath] - Optional: A specific path for the wrapper script. If omitted, a temporary path is generated.
 * @param {number} [keyFilePermissions=0o600] - Optional: Unix file mode (permissions) for the private key file. Defaults to 0o600 (owner read/write).
 * @param {function(Error|null, string|null, string|null)} completionCallback - Callback function invoked upon completion, with (error, scriptFilePath, privateKeyFilePath).
 */
function prepareSshKeyWrapper(sshPrivateKeyContent, wrapperScriptPath, keyFilePermissions, completionCallback) {
    // Initial validation of the private key content.
    if (typeof sshPrivateKeyContent !== 'string' || sshPrivateKeyContent.trim() === '') {
        return completionCallback(new Error("The SSH private key content must be a non-empty string."), null, null);
    }

    // Adjust arguments based on flexible function signature (Type III change for robustness).
    let effectiveCallback = completionCallback;
    let effectiveWrapperScriptPath = wrapperScriptPath;
    let effectiveKeyFilePermissions = keyFilePermissions || 0o600;

    if (typeof wrapperScriptPath === 'function') {
        effectiveCallback = wrapperScriptPath;
        effectiveWrapperScriptPath = null; // Reset to default behavior (generate temp file)
        effectiveKeyFilePermissions = 0o600; // Reset to default permissions
    } else if (typeof keyFilePermissions === 'function') {
        effectiveCallback = keyFilePermissions;
        effectiveKeyFilePermissions = 0o600; // Reset to default permissions
    }

    // Determine the actual paths for the temporary files.
    const actualWrapperScriptPath = effectiveWrapperScriptPath || createEphemeralFile("_git_ssh_wrapper", ".sh");
    const actualPrivateKeyFilePath = createEphemeralFile("_git_id_rsa", ".key");

    // Populate the SSH script template with the private key file's path.
    const finalScriptContent = sshScriptBase.replace('$KEYFILE_PATH', actualPrivateKeyFilePath);

    // Utilize Promises for managing asynchronous file operations sequentially and in parallel.
    // This replaces the 'Step' library for a modern control flow.
    Promise.all([
        // Write the SSH wrapper script to disk.
        new Promise((resolve, reject) => {
            fileSys.writeFile(actualWrapperScriptPath, finalScriptContent, { encoding: 'utf8', mode: 0o700 }, (err) => {
                if (err) return reject(new Error(`Failed to write SSH wrapper script: ${err.message}`));
                resolve();
            });
        }),
        // Write the private SSH key content to disk.
        new Promise((resolve, reject) => {
            fileSys.writeFile(actualPrivateKeyFilePath, sshPrivateKeyContent, { encoding: 'utf8', mode: effectiveKeyFilePermissions }, (err) => {
                if (err) return reject(new Error(`Failed to write private key file: ${err.message}`));
                resolve();
            });
        })
    ])
    .then(() => {
        // Explicitly set file permissions after writing, ensuring executability for the script
        // and strict security for the private key. This acts as a double-check.
        return Promise.all([
            new Promise((resolve, reject) => {
                fileSys.chmod(actualWrapperScriptPath, 0o700, (err) => { // Script needs execute permission
                    if (err) return reject(new Error(`Failed to set permissions for wrapper script: ${err.message}`));
                    resolve();
                });
            }),
            new Promise((resolve, reject) => {
                fileSys.chmod(actualPrivateKeyFilePath, effectiveKeyFilePermissions, (err) => { // Key must be highly restricted
                    if (err) return reject(new Error(`Failed to set permissions for private key: ${err.message}`));
                    resolve();
                });
            })
        ]);
    })
    .then(() => {
        // All file preparation and permission setting operations completed successfully.
        effectiveCallback(null, actualWrapperScriptPath, actualPrivateKeyFilePath);
    })
    .catch((operationError) => {
        // Centralized error handling for any failures during the promise chain.
        console.error(`An error occurred during SSH key wrapper preparation: ${operationError.message}`);
        // Attempt to clean up any partially created temporary files to prevent residue.
        try {
            if (fileSys.existsSync(actualWrapperScriptPath)) fileSys.unlinkSync(actualWrapperScriptPath);
            if (fileSys.existsSync(actualPrivateKeyFilePath)) fileSys.unlinkSync(actualPrivateKeyFilePath);
        } catch (cleanupFailure) {
            console.error(`Failed to clean up temporary files after an error: ${cleanupFailure.message}`);
        }
        effectiveCallback(operationError, null, null);
    });
}

/**
 * Executes a Git command as a child process, leveraging a temporary SSH key wrapper for authentication.
 * This function orchestrates the creation of temporary SSH files, command execution, and cleanup.
 *
 * @param {object|string} optsOrWorkingDir - Can be an object of options, or the working directory string.
 *                                          If an object, it may contain:
 *                                          `workingDirectory`, `privateSshKey`, `commandString`, `keyAccessMode`,
 *                                          `outputEventsEmitter` (an EventDispatcher), `customSpawn` (a custom spawn function),
 *                                          `detached` (boolean, defaults to true).
 * @param {string} [privateSshKey_] - Private SSH key content (if `optsOrWorkingDir` is a string).
 * @param {string} [commandString_] - The full Git command string (if `optsOrWorkingDir` is a string).
 * @param {number} [keyAccessMode_] - Unix file permissions for the private key file (e.g., 0o600).
 * @param {function(Error|null, string, string, number)} executionCompleted - Callback function (error, stdout, stderr, exitCode).
 */
function executeGitCommand(optsOrWorkingDir, privateSshKey_, commandString_, keyAccessMode_, executionCompleted) {
    let actualWorkingDirectory;
    let actualPrivateKeyContent;
    let finalCommandString;
    let effectiveKeyAccessMode = 0o600; // Default to secure permissions
    let commandOutputDispatcher = null; // Event emitter for real-time output
    let isDetachedProcess = true; // Default to detached to prevent blocking
    let processLauncher = childProcessManager.spawn; // Default child process spawner

    // Flexible argument parsing (Type III structural change for parameter handling).
    if (typeof optsOrWorkingDir === 'object' && optsOrWorkingDir !== null) {
        const executionOptions = optsOrWorkingDir;
        executionCompleted = privateSshKey_; // Callback is the second argument in this case.

        actualWorkingDirectory = executionOptions.workingDirectory;
        actualPrivateKeyContent = executionOptions.privateSshKey;
        finalCommandString = executionOptions.commandString;
        effectiveKeyAccessMode = executionOptions.keyAccessMode || 0o600;
        commandOutputDispatcher = executionOptions.outputEventsEmitter || null;
        processLauncher = executionOptions.customSpawn || childProcessManager.spawn;
        if (typeof executionOptions.detached !== 'undefined') {
            isDetachedProcess = executionOptions.detached;
        }
    } else {
        // Positional argument handling.
        actualWorkingDirectory = optsOrWorkingDir;
        actualPrivateKeyContent = privateSshKey_;
        finalCommandString = commandString_;
        // Adjust for optional `keyAccessMode_` and callback shifting.
        if (typeof keyAccessMode_ === 'function') {
            executionCompleted = keyAccessMode_;
            effectiveKeyAccessMode = 0o600;
        } else {
            effectiveKeyAccessMode = keyAccessMode_ || 0o600;
        }
    }

    // Critical input validations (Type III additions for robustness).
    if (typeof finalCommandString !== 'string' || finalCommandString.trim() === '') {
        return executionCompleted(new Error("The Git command string cannot be empty."), "", "", -1);
    }
    if (typeof actualWorkingDirectory !== 'string' || !fileSys.existsSync(actualWorkingDirectory)) {
        return executionCompleted(new Error(`Invalid or non-existent working directory: ${actualWorkingDirectory}`), "", "", -1);
    }

    // Split the command string into the main command and its arguments.
    // Filter out any empty strings resulting from multiple spaces.
    const commandElements = finalCommandString.split(/\s+/).filter(element => element.length > 0);
    const primaryCommand = commandElements[0];
    const commandArguments = commandElements.slice(1);

    let tempScriptFilePath = null;
    let tempKeyMaterialPath = null;

    // Asynchronous flow using `async/await` for sequential and error-safe execution.
    const manageProcessLifecycle = async () => {
        try {
            // Phase 1: Prepare the SSH wrapper script and private key files.
            const [scriptPath, keyPath] = await new Promise((resolve, reject) => {
                prepareSshKeyWrapper(actualPrivateKeyContent, null, effectiveKeyAccessMode, (err, sPath, kPath) => {
                    if (err) return reject(new Error(`Failed to set up SSH authentication files: ${err.message}`));
                    resolve([sPath, kPath]);
                });
            });
            tempScriptFilePath = scriptPath;
            tempKeyMaterialPath = keyPath;

            // Phase 2: Execute the Git command in a child process.
            const processExecutionEnvironment = {
                ...process.env, // Inherit current process environment variables.
                GIT_SSH: tempScriptFilePath, // Crucial for Git to use our wrapper.
                PATH: execPathEnv // Use our potentially modified PATH.
            };

            const spawnedProcess = processLauncher(primaryCommand, commandArguments, {
                cwd: actualWorkingDirectory,
                env: processExecutionEnvironment,
                detached: isDetachedProcess,
                // `shell: true` can be added here if the command requires shell interpretation,
                // but it's generally safer to avoid for direct `git` commands.
            });

            let accumulatedStdout = "";
            let accumulatedStderr = "";

            spawnedProcess.stdout.setEncoding('utf8');
            spawnedProcess.stderr.setEncoding('utf8');

            // Collect stdout data and optionally dispatch events.
            spawnedProcess.stdout.on('data', (dataBuffer) => {
                if (commandOutputDispatcher) {
                    commandOutputDispatcher.emit('stdout', dataBuffer);
                }
                accumulatedStdout += dataBuffer;
            });

            // Collect stderr data and optionally dispatch events.
            spawnedProcess.stderr.on('data', (dataBuffer) => {
                if (commandOutputDispatcher) {
                    commandOutputDispatcher.emit('stderr', dataBuffer);
                }
                accumulatedStderr += dataBuffer;
            });

            // Implement a timeout mechanism for the child process (Type III addition for robustness).
            const PROCESS_TIMEOUT_MS = 300000; // 5 minutes (300,000 milliseconds)
            const timeoutMonitor = setTimeout(() => {
                if (!spawnedProcess.killed) {
                    spawnedProcess.kill('SIGTERM'); // Send termination signal.
                    console.warn(`Process for command "${finalCommandString}" timed out after ${PROCESS_TIMEOUT_MS / 1000} seconds.`);
                    executionCompleted(new Error(`Command execution exceeded ${PROCESS_TIMEOUT_MS / 1000}s timeout.`), accumulatedStdout, accumulatedStderr, -1);
                }
            }, PROCESS_TIMEOUT_MS);

            // Wait for the child process to close or encounter an error.
            const { exitCode, exitSignal } = await new Promise((resolve, reject) => {
                spawnedProcess.on('close', (code, signal) => {
                    clearTimeout(timeoutMonitor); // Clear timeout if process finishes naturally.
                    resolve({ exitCode: code, exitSignal: signal });
                });
                spawnedProcess.on('error', (spawnError) => {
                    clearTimeout(timeoutMonitor); // Clear timeout on early error.
                    reject(new Error(`Failed to launch child process: ${spawnError.message}`));
                });
            });

            let finalExecutionError = null;
            if (exitCode !== 0) {
                finalExecutionError = new Error(`Command "${primaryCommand}" exited with non-zero status ${exitCode}. Error output: ${accumulatedStderr.trim()}`);
            } else if (exitSignal) {
                finalExecutionError = new Error(`Command "${primaryCommand}" terminated by signal ${exitSignal}.`);
            }

            // Report the outcome to the original callback.
            executionCompleted(finalExecutionError, accumulatedStdout, accumulatedStderr, exitCode);

        } catch (overallError) {
            console.error(`An unexpected error occurred during Git command execution: ${overallError.message}`);
            executionCompleted(overallError, "", "", -1);
        } finally {
            // Phase 3: Clean up all temporary files regardless of success or failure.
            const filesToRemove = [tempScriptFilePath, tempKeyMaterialPath].filter(Boolean); // Filter out any null paths.
            for (const filePath of filesToRemove) {
                try {
                    // Only attempt to unlink if the file actually exists.
                    if (fileSys.existsSync(filePath)) {
                        fileSys.unlinkSync(filePath);
                        // console.log(`Successfully removed temporary file: ${filePath}`); // Optional: for debugging.
                    }
                } catch (cleanupIssue) {
                    console.error(`Failed to remove temporary file ${filePath}: ${cleanupIssue.message}`);
                }
            }
        }
    };

    manageProcessLifecycle(); // Initiate the asynchronous process flow.
}

/**
 * Provides a simplified interface to perform a Git clone operation using the `executeGitCommand` utility.
 *
 * @param {string} cloneArguments - The arguments specific to the `git clone` command (e.g., "https://github.com/user/repo.git my-project").
 * @param {string} destinationPath - The working directory where the clone command should be executed.
 * @param {string} sshKeyContent - The private SSH key content required for repository authentication.
 * @param {function(Error|null, string, string, number)} callbackFn - Callback function (error, stdout, stderr, exitCode).
 */
function performGitClone(cloneArguments, destinationPath, sshKeyContent, callbackFn) {
    // Basic input validation for the clone arguments (Type III addition).
    if (typeof cloneArguments !== 'string' || cloneArguments.trim() === '') {
        return callbackFn(new Error("Clone arguments must be a non-empty string."), "", "", -1);
    }
    const fullCloneCommand = `git clone ${cloneArguments}`;
    // Delegate the actual execution to the more general `executeGitCommand` function.
    executeGitCommand(destinationPath, sshKeyContent, fullCloneCommand, callbackFn);
}

/**
 * Modifies the global execution PATH environment variable by appending a new directory.
 * Includes a check to prevent adding duplicate path segments, ensuring PATH remains clean.
 * @param {string} newPathSegment - The directory path to be appended to the PATH.
 */
function extendSystemPath(newPathSegment) {
    if (typeof newPathSegment !== 'string' || newPathSegment.trim() === '') {
        console.warn("Attempted to add an empty or invalid path segment to the system PATH; operation skipped.");
        return;
    }
    // Split the current PATH by the platform-specific delimiter.
    const currentPathSegments = execPathEnv.split(pathUtil.delimiter);
    // Check if the new segment already exists to prevent redundancy (Type III addition).
    if (!currentPathSegments.includes(newPathSegment)) {
        execPathEnv = currentPathSegments.concat(newPathSegment).join(pathUtil.delimiter);
        // console.log(`System PATH successfully updated to: ${execPathEnv}`); // Optional debug output.
    } else {
        console.log(`Path segment '${newPathSegment}' is already present in the system PATH.`);
    }
}

// Export the module's public interface, with renamed functions.
module.exports = {
    performGitClone: performGitClone,
    executeGitCommand: executeGitCommand,
    prepareSshKeyWrapper: prepareSshKeyWrapper,
    extendSystemPath: extendSystemPath,
};