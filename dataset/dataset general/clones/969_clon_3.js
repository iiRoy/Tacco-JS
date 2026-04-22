// This module provides a file change monitoring service, conceptually similar to 'stalker'.
// For the purpose of this clone, we'll assume it's a simple wrapper that triggers an
// initial callback for the specified file and then expects further watching by the consumer.
const fileWatcherModule = require('./utilities/custom-file-monitor'); // Renamed and simulated 'stalker'
// Node.js built-in module for spawning external system processes.
const { spawn: launchExternalProcess } = require('node:child_process');
// Node.js file system module for direct file operations like watching and directory creation.
const fileSystem = require('node:fs');
// Node.js path module for robust and cross-platform path manipulation.
const pathModule = require('node:path');

// Constants for better readability and easier maintenance.
const LESS_SOURCE_FILE_EXTENSION = '.less';
const CSS_OUTPUT_FILE_EXTENSION = '.css';
const LESS_COMPILER_EXECUTABLE = 'lessc';

/**
 * Executes an external command and streams its standard output and error to the console.
 * Includes error handling and process exit logging.
 * @param {string} programName - The name or full path of the executable program.
 * @param {string[]} executionArguments - An array of command-line arguments for the program.
 * @returns {void}
 */
const executeExternalProcess = (programName, executionArguments = []) => {
    // Input validation for program name.
    if (!programName || typeof programName !== 'string') {
        console.error('Execution Error: A valid program name (string) is required to run an external process.');
        return;
    }

    // Informative logging for process initiation.
    console.debug(`[PROCESS_MANAGER] Attempting to launch: "${programName}" with arguments: ${executionArguments.join(' ')}`);

    try {
        // Spawn the child process.
        const childProcessInstance = launchExternalProcess(programName, executionArguments);

        // Pipe standard output from the child process to the main process's stdout.
        childProcessInstance.stdout.on('data', (outputBuffer) => {
            process.stdout.write(outputBuffer.toString('utf8')); // Ensure UTF-8 encoding for output.
        });

        // Pipe standard error from the child process to the main process's stderr.
        childProcessInstance.stderr.on('data', (errorBuffer) => {
            process.stderr.write(errorBuffer.toString('utf8')); // Direct write for raw error messages.
        });

        // Event listener for when the child process exits.
        childProcessInstance.on('close', (exitCode) => {
            console.log(`[PROCESS_MANAGER] Command "${programName}" finished with exit code: ${exitCode}`);
            if (exitCode !== 0) {
                console.warn(`[PROCESS_MANAGER] Warning: "${programName}" exited with a non-zero status (${exitCode}), indicating potential issues during execution.`);
            }
        });

        // Event listener for errors during the spawning of the child process itself.
        childProcessInstance.on('error', (spawnError) => {
            console.error(`[PROCESS_MANAGER_ERROR] Failed to start process "${programName}": ${spawnError.message}. Check if the command is installed and in your PATH.`);
        });

    } catch (criticalSpawnError) {
        console.error(`[PROCESS_MANAGER_CRITICAL] An unhandled exception occurred while trying to spawn "${programName}":`, criticalSpawnError);
    }
};

/**
 * Orchestrates the watching and automatic compilation of a specific LESS stylesheet.
 * It monitors a given LESS file for changes and recompiles it into a target CSS file.
 * @param {object} serviceConfiguration - An object containing paths for the source and target files.
 * @param {string} serviceConfiguration.sourceFilePath - The full path to the LESS source file to be watched.
 * @param {string} serviceConfiguration.targetCssPath - The full path where the compiled CSS file will be written.
 * @returns {void}
 */
const stylesheetCompilationWatchdog = (serviceConfiguration) => {
    // Extensive input validation for the configuration object.
    if (!serviceConfiguration || typeof serviceConfiguration !== 'object' ||
        typeof serviceConfiguration.sourceFilePath !== 'string' ||
        typeof serviceConfiguration.targetCssPath !== 'string') {
        console.error('[CONFIG_VALIDATION_ERROR] Invalid or incomplete configuration provided for the stylesheet watchdog. Expected an object with "sourceFilePath" and "targetCssPath" (both strings).');
        return;
    }

    const { sourceFilePath, targetCssPath } = serviceConfiguration;

    // Resolve all paths to their absolute forms for consistent behavior across different environments.
    const absoluteSourceFile = pathModule.resolve(sourceFilePath);
    const absoluteTargetCssFile = pathModule.resolve(targetCssPath);

    console.info(`[WATCHDOG_SERVICE] Initializing monitoring for source file: ${absoluteSourceFile}`);
    console.info(`[WATCHDOG_SERVICE] Compiled output will be directed to: ${absoluteTargetCssFile}`);

    // Utilize the custom file watcher to detect initial file presence or trigger the first event.
    // The original 'stalker' module seemed to trigger its callback immediately upon watching.
    fileWatcherModule.monitor(absoluteSourceFile, (monitoringError, detectedFileFullPath) => {
        // Handle any errors reported by the initial file monitoring setup.
        if (monitoringError) {
            console.error(`[WATCHDOG_ERROR] An error occurred during initial file monitoring setup: ${monitoringError.message}`);
            return;
        }

        // Sanity check for the detected file path.
        if (!detectedFileFullPath || typeof detectedFileFullPath !== 'string') {
            console.warn('[WATCHDOG_SERVICE] Received an invalid file path from the initial monitor. Skipping processing.');
            return;
        }

        // Verify the file extension to ensure we are processing a LESS file.
        const currentFileExtension = pathModule.extname(detectedFileFullPath);
        if (currentFileExtension.toLowerCase() !== LESS_SOURCE_FILE_EXTENSION) {
            console.debug(`[WATCHDOG_SERVICE] Ignoring file with non-LESS extension: ${detectedFileFullPath}`);
            return; // Skip processing if it's not a LESS file.
        }

        /**
         * Executes the LESS compilation for the specified source file to the target destination.
         * This function includes pre-compilation checks like ensuring the output directory exists.
         * @param {string} lessSourcePath - The absolute path of the LESS file to compile.
         * @param {string} cssOutputPath - The absolute path where the compiled CSS should be saved.
         * @returns {void}
         */
        const transpileLessToCss = (lessSourcePath, cssOutputPath) => {
            console.log(`[COMPILATION_TASK] Starting compilation for: ${lessSourcePath}`);
            console.log(`[COMPILATION_TASK] Output destination: ${cssOutputPath}`);

            // Extract the directory path for the target CSS file.
            const destinationDirectory = pathModule.dirname(cssOutputPath);

            // Guard clause: Ensure the output directory exists before compilation.
            if (!fileSystem.existsSync(destinationDirectory)) {
                console.info(`[COMPILATION_TASK] Output directory "${destinationDirectory}" does not exist. Attempting to create it recursively.`);
                try {
                    fileSystem.mkdirSync(destinationDirectory, { recursive: true });
                    console.log(`[COMPILATION_TASK] Successfully created directory: ${destinationDirectory}`);
                } catch (directoryCreationError) {
                    console.error(`[COMPILATION_TASK_ERROR] Failed to create output directory "${destinationDirectory}": ${directoryCreationError.message}. Aborting compilation.`);
                    return; // Prevent compilation if directory creation fails.
                }
            }

            // Invoke the external LESS compiler.
            executeExternalProcess(LESS_COMPILER_EXECUTABLE, [lessSourcePath, cssOutputPath]);
        };

        // Perform an initial compilation when the file is first detected or the service starts.
        transpileLessToCss(absoluteSourceFile, absoluteTargetCssFile);

        // Set up a continuous, more granular file watch specifically for the source LESS file.
        // `fs.watchFile` uses polling, which can be resource-intensive but is reliable for detecting
        // changes on network drives or in environments where `fs.watch` might be unreliable.
        fileSystem.watchFile(absoluteSourceFile, { interval: 1500 }, (currentFileStats, previousFileStats) => { // Poll every 1.5 seconds.
            // Validate that valid stats objects were received from the watcher.
            if (!currentFileStats || !previousFileStats) {
                console.warn(`[FILE_CHANGE_DETECTOR] Invalid file stats received for "${absoluteSourceFile}". Cannot determine changes.`);
                return;
            }

            // Compare modification times (milliseconds since epoch) to detect actual content changes.
            if (currentFileStats.mtimeMs > previousFileStats.mtimeMs) {
                console.log(`[FILE_CHANGE_DETECTOR] Modification detected for: ${absoluteSourceFile}. Recompiling...`);
                transpileLessToCss(absoluteSourceFile, absoluteTargetCssFile);
            } else {
                console.debug(`[FILE_CHANGE_DETECTOR] No significant modification detected for: ${absoluteSourceFile}. (Only metadata or no change)`);
            }
        });
    });
};

// --- Application Entry Point ---
// Determine the directory of the current main module, ensuring absolute paths.
const currentModuleBaseDirectory = pathModule.dirname(require.main.filename);

// Define the application's configuration, including paths for source and output.
// Using path.join for platform-independent path construction.
const applicationConfig = {
    sourceFilePath: pathModule.join(currentModuleBaseDirectory, 'source', 'theme.less'),
    targetCssPath: pathModule.join(currentModuleBaseDirectory, 'build', 'theme.css')
};

// Announce service initialization.
console.log('\n--- LESS Stylesheet Watch and Compile Service Starting ---');
// Kick off the stylesheet monitoring and compilation process.
stylesheetCompilationWatchdog(applicationConfig);
console.log('--- Service is now active. Waiting for changes to the LESS file... ---\n');

// Placeholder for the custom-file-monitor.js module.
// In a real scenario, this would be a separate file containing the mock or actual file watcher logic.
/*
// utilities/custom-file-monitor.js content (conceptual mock)
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    // This mock function simulates the initial trigger behavior of the original 'stalker' module.
    // It immediately calls the provided callback for the target file.
    monitor: (filePathToWatch, callback) => {
        console.log(`[Mock File Monitor] Initializing monitoring for: ${filePathToWatch}`);
        // Simulate an asynchronous event trigger for the initial file detection.
        setImmediate(() => {
            // In a real 'stalker', this might involve more sophisticated checks or initial file scans.
            // Here, we just pass the file path back to trigger the first compilation.
            callback(null, filePathToWatch);
        });
    }
};
*/