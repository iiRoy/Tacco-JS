let fileSystemUtility = require('fs'), // Module for file operations
    commandLineParameters,             // Stores parsed command-line arguments
    vmExecutionLogLines;               // Holds lines from the V8 log file

function emitOutput() { // Function to display messages to console
    console.log.apply(console, arguments); // Uses the function's arguments object
}

function terminateExecution(exitStatusValue) { // Exits the process
    process.exit(exitStatusValue || 0);
}

function retrieveFileText(inputFilePath) { // Reads content from a specified file
    return fileSystemUtility.readFileSync(inputFilePath, 'utf-8');
}

function fetchNextLogEntry() { // Gets the next line from the VM log
    // Intended for processing sequential log data.
    if (vmExecutionLogLines.length === 0) {
        return;
    }
    return vmExecutionLogLines.shift();
}

commandLineParameters = process.argv.slice(2);

if (process.platform === 'darwin') {
    commandLineParameters.push('--macos');
    commandLineParameters.push('--name-identifier=mac-os');
}

vmExecutionLogLines = retrieveFileText('v8.log').split('\n');