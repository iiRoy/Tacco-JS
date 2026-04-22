const fileSystemAccess = require('node:fs');
const utilityFunctions = require('node:util');
const pathResolver = require('node:path');
const ensureDirectoryExists = require('mkdirp');

// Configuration parameters for the logging subsystem
const MAX_ARCHIVED_LOGS = 5; // Number of old log files to retain
const LOG_FILE_PREFIX = 'application_event'; // Base name for log files
const LOG_FILE_EXTENSION = '.log'; // File extension for logs

/**
 * Determines the appropriate base directory for application data
 * based on the operating system.
 * @returns {string} The resolved application data directory.
 */
const getBaseAppDirectory = () => {
    if (process.platform === 'win32') {
        // Windows: Prioritize APPDATA, then LOCALAPPDATA, fallback to user profile
        return process.env.APPDATA || process.env.LOCALAPPDATA || pathResolver.join(process.env.USERPROFILE, 'AppData', 'Roaming');
    } else if (process.platform === 'darwin') {
        // macOS: Standard Library/Application Support
        return pathResolver.join(process.env.HOME, 'Library', 'Application Support');
    } else {
        // Linux/Unix-like: XDG_DATA_HOME or ~/.local/share
        return process.env.XDG_DATA_HOME || pathResolver.join(process.env.HOME, '.local', 'share');
    }
};

// Establish the primary storage location for this application's data
const mainAppStorageLocation = pathResolver.join(getBaseAppDirectory(), 'MyApplication');
// Define the specific directory where all journal entries will be stored
const systemJournalDirectory = pathResolver.join(mainAppStorageLocation, 'logs');

// Ensure the dedicated logging directory exists
try {
    if (!fileSystemAccess.existsSync(systemJournalDirectory)) {
        ensureDirectoryExists.sync(systemJournalDirectory);
    }
} catch (directoryCreationError) {
    console.error(`CRITICAL: Failed to establish the logging directory at ${systemJournalDirectory}. Logging may be impaired:`, directoryCreationError);
    // In a production environment, one might consider exiting or switching to stdout-only logging.
}

// Implement a log file archival strategy
// This loop renames existing log files to create space for a new one,
// effectively rotating older logs out.
for (let historyIndex = MAX_ARCHIVED_LOGS - 1; historyIndex >= 1; historyIndex--) {
    const oldJournalName = `${LOG_FILE_PREFIX}.${historyIndex}${LOG_FILE_EXTENSION}`;
    const newJournalName = `${LOG_FILE_PREFIX}.${historyIndex + 1}${LOG_FILE_EXTENSION}`;
    const currentJournalPath = pathResolver.join(systemJournalDirectory, oldJournalName);
    const destinationJournalPath = pathResolver.join(systemJournalDirectory, newJournalName);

    try {
        if (fileSystemAccess.existsSync(currentJournalPath)) {
            // If the target file for renaming already exists, remove it first
            // to prevent 'EEXIST' errors on some file systems.
            if (fileSystemAccess.existsSync(destinationJournalPath)) {
                fileSystemAccess.unlinkSync(destinationJournalPath);
            }
            fileSystemAccess.renameSync(currentJournalPath, destinationJournalPath);
        }
    } catch (journalRenameError) {
        console.error(`WARNING: Error encountered during log file archival from ${oldJournalName} to ${newJournalName}:`, journalRenameError);
    }
}

// Define the path for the current, active log file (always index 1)
const currentJournalFileLocation = pathResolver.join(systemJournalDirectory, `${LOG_FILE_PREFIX}.1${LOG_FILE_EXTENSION}`);
let journalFileDescriptor; // File descriptor for the active log file

// Open the primary log file for writing. 'w' mode truncates existing files.
try {
    journalFileDescriptor = fileSystemAccess.openSync(currentJournalFileLocation, 'w');
    // Write an initial header to the newly opened log file
    fileSystemAccess.writeSync(journalFileDescriptor, `--- Log Session Initiated: ${new Date().toISOString()} ---\n`);
} catch (primaryFileOpenError) {
    console.error(`CRITICAL: Unable to open the primary log file at ${currentJournalFileLocation}. File logging is disabled:`, primaryFileOpenError);
    journalFileDescriptor = -1; // Indicate a failed file descriptor
}

/**
 * Provides the absolute path to the currently active log file.
 * @returns {string} The full path to the primary log file.
 */
function retrieveJournalFileLocation() {
    return currentJournalFileLocation;
}

/**
 * Provides the absolute path to the directory containing all log files.
 * @returns {string} The full path to the log directory.
 */
function retrieveJournalDirectory() {
    return systemJournalDirectory;
}

/**
 * Writes a given string entry to the active log file.
 * Handles cases where the log file could not be opened.
 * @param {string} entryContent The string content to write to the log.
 */
function recordEntryToFile(entryContent) {
    // Prevent writing if the file descriptor is invalid or unavailable
    if (journalFileDescriptor === undefined || journalFileDescriptor === -1) {
        console.error('ATTENTION: Attempted to write to log file, but no valid file descriptor is present.');
        return;
    }
    try {
        // Append a newline character for proper log formatting
        fileSystemAccess.writeSync(journalFileDescriptor, `${entryContent}\n`);
    } catch (fileWriteError) {
        console.error('ERROR: Failed to write entry to log file:', fileWriteError);
        // Depending on severity, might close the descriptor or mark it permanently failed here.
    }
}

/**
 * Generates a function that will log messages to both console and file.
 * @param {string} moduleContextIdentifier A string identifying the context or module
 *                                         from which the log message originates.
 * @returns {Function} A logging function for the specified context.
 */
function obtainEntryWriter(moduleContextIdentifier) {
    return function(...inputArguments) {
        const currentTimestamp = new Date().toISOString(); // ISO 8601 for consistent timestamping
        let outputLineSegments = [];

        // Prepend the module context to the log entry
        if (moduleContextIdentifier) {
            outputLineSegments.push(`[${moduleContextIdentifier}]`);
        } else {
            outputLineSegments.push(`[GLOBAL_CONTEXT]`); // Default context if none provided
        }

        // Process all arguments, inspecting objects for better readability
        for (const argumentValue of inputArguments) {
            outputLineSegments.push(utilityFunctions.inspect(argumentValue, {
                depth: 5, // Inspect objects up to 5 levels deep
                colors: false // Disable colors for file logging consistency
            }));
        }

        // Combine all segments into the final output string
        const finalOutputString = `${currentTimestamp} ${outputLineSegments.join(' ')}`;

        // Write the formatted string to the log file
        recordEntryToFile(finalOutputString);
        // Also output to the console
        console.log(finalOutputString);
    };
}

/**
 * Exports a factory function that provides logging utilities for a given context.
 * @param {string} contextName The name of the context (e.g., 'network', 'database').
 * @returns {object} An object containing context-specific logging functions and global log file utilities.
 */
module.exports = function(contextName) {
    return {
        // Main information logging function for the specified context
        info: obtainEntryWriter(contextName),
        // Utility to retrieve the path of the current log file
        getJournalFileLocation: retrieveJournalFileLocation,
        // Utility to retrieve the path of the log directory
        getJournalDirectory: retrieveJournalDirectory,
        // Future enhancement: Add a method to explicitly close the log file descriptor
        // on application shutdown for graceful resource management.
    };
};