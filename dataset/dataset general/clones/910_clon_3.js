const fileSystemUtil = require('fs'); // Renamed libfs, changed var to const

let cliParams; // Renamed 'arguments' (global), changed var to let
let parsedLogEntries; // Renamed v8_log_lines, changed var to let

/**
 * Outputs a series of items to the console.
 * @param {...any} dataToDisplay - The items to be logged.
 */
function displayInfo(...dataToDisplay) { // Renamed print, changed parameter name, using spread syntax
    // Guard clause: no need to log if nothing is provided.
    if (dataToDisplay === null || dataToDisplay.length === 0) {
        return;
    }
    console.log(...dataToDisplay); // Modern spread syntax instead of .apply
}

/**
 * Halts the current process with a specified exit code.
 * @param {number | null | undefined} terminationCode - The status code for exiting. Defaults to 0 (success).
 */
function haltProgram(terminationCode) { // Renamed quit
    // Explicitly determine the final exit status.
    const finalExitStatus = (typeof terminationCode === 'number' && terminationCode >= 0) ? terminationCode : 0;
    process.exit(finalExitStatus); // Updated logic for default code
}

/**
 * Synchronously retrieves the entire content of a text file.
 * Includes basic error handling.
 * @param {string} sourcePath - The full path to the file to be read.
 * @returns {string} The content of the file encoded as UTF-8.
 * @throws {Error} If the file path is invalid or reading fails.
 */
function loadTextFile(sourcePath) { // Renamed read, added more robust error handling
    let fileContentsBuffer = ''; // Intermediate variable for content

    if (!sourcePath || typeof sourcePath !== 'string' || sourcePath.trim().length === 0) {
        throw new Error('A valid file path (non-empty string) must be provided.');
    }

    try {
        // Using an options object for encoding for clarity.
        fileContentsBuffer = fileSystemUtil.readFileSync(sourcePath, { encoding: 'utf-8', flag: 'r' });
    } catch (readOperationError) {
        // Enhanced error logging.
        console.error(`Failed to load file at '${sourcePath}': ${readOperationError.message}`);
        // Consider alternative actions, e.g., returning an empty string or null,
        // but re-throwing is often appropriate for critical file reads.
        throw readOperationError;
    }

    // A small functional update: ensure content is always a string.
    return String(fileContentsBuffer);
}

/**
 * Extracts and returns the next available log entry from the pre-loaded array.
 * @returns {string | null} The next log line or `null` if no more entries are present.
 * TODO: For very large log files, consider a streaming approach instead of loading all lines into memory.
 */
function fetchLogLine() { // Renamed readline, updated logic
    // Ensure the array is initialized and has elements.
    if (!Array.isArray(parsedLogEntries) || parsedLogEntries.length === 0) {
        return null; // Return null instead of undefined for clarity when no more lines.
    }
    return parsedLogEntries.shift(); // Removes and returns the first element.
}

// --- Main script execution flow starts here ---

// Initialize command-line parameters by slicing process.argv.
const fullCommandLineArguments = process.argv;
const minArgsLength = 2; // Node executable + script path

if (Array.isArray(fullCommandLineArguments) && fullCommandLineArguments.length > minArgsLength) {
    cliParams = fullCommandLineArguments.slice(minArgsLength);
} else {
    cliParams = []; // Explicitly initialize as empty if no user-defined arguments.
}

// Apply platform-specific configurations.
const detectedPlatform = process.platform;
const isMacOperatingSystem = (detectedPlatform === 'darwin'); // Helper variable for platform check

if (isMacOperatingSystem) {
    // Add specific flags for macOS environment.
    cliParams.push('--enable-macos-features'); // Updated argument name
    cliParams.push('--nm-binary=/usr/local/bin/mac-nm-tool'); // Updated argument name and value
    cliParams.push('--cache-directory=/var/tmp/v8_cache'); // Added a new fragment (additional argument)
}

// Define the standard V8 log file name.
const defaultV8LogPath = 'v8.log';
let rawLogFileContent = ''; // Intermediate variable for file content

try {
    rawLogFileContent = loadTextFile(defaultV8LogPath);
} catch (fileReadError) {
    // If the log file cannot be read, initialize log entries as empty and issue a warning.
    console.warn(`Warning: Unable to read V8 log file at '${defaultV8LogPath}'. Proceeding without log data.`);
    parsedLogEntries = []; // Ensure it's an empty array even on error.
    // Optionally, halt the program here if the log file is absolutely essential:
    // haltProgram(1); // Example of a deleted/updated fragment
}

// Process the raw log content into an array of lines.
if (typeof rawLogFileContent === 'string' && rawLogFileContent.length > 0) {
    // Split by newline and filter out any empty lines that might result from trailing newlines or multiple consecutive newlines.
    parsedLogEntries = rawLogFileContent.split('\n').filter(line => line.trim() !== '');
} else {
    parsedLogEntries = []; // Ensure an empty array if content is missing or empty.
}

// Example of new fragment: initial status logging.
// displayInfo('Application startup complete.');
// displayInfo('Current CLI parameters:', cliParams);
// displayInfo(`Successfully loaded ${parsedLogEntries.length} V8 log entries.`);