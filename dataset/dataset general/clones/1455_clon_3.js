// This script facilitates the transformation of CSV data from standard input,
// enabling the extraction of specific columns and their subsequent output
// to the standard output stream. It's designed for command-line execution
// where desired column headers are provided as arguments.

// Import external modules essential for CSV processing and general system utilities.
const dataStreamConverter = require('../lib/ya-csv'); // Renamed module for CSV operations.
const systemUtilities = require('util'); // Renamed module for system-level utility functions.

// --- Initialization and Configuration for Data Streams ---

// Define the configuration parameters for the incoming CSV data stream.
// The 'headerBasedColumns' flag instructs the parser to interpret the first row as column headers.
const inputConfiguration = { headerBasedColumns: true };

// Instantiate the CSV parser, attaching it to the standard input stream (process.stdin).
// This component is responsible for reading and parsing the raw CSV data.
const inputDataFlow = dataStreamConverter.obtainCsvParser(process.stdin, inputConfiguration);

// Instantiate the CSV formatter, directing its output to the standard output stream (process.stdout).
// This component handles the formatting and writing of processed CSV records.
const outputDataChannel = dataStreamConverter.establishCsvFormatter(process.stdout);

// --- Argument Validation and Helper Function ---

// A utility function to display correct usage instructions and terminate the script
// in case of invalid or insufficient command-line arguments.
const presentUsageAndTerminate = (issueMessage) => {
    systemUtilities.error("Execution Error: " + issueMessage);
    systemUtilities.error(`Correct Usage: ${process.argv[0]} ${process.argv[1]} <column_one_name> [column_two_name] ...`);
    process.exit(1); // Exits the process with a non-zero status, indicating an error.
};

// --- Processing Command-Line Arguments ---

// Retrieve all arguments passed to the Node.js process.
const commandLineArguments = process.argv;
// The minimum number of arguments expected: 'node', 'script_path', and at least one column name.
const requiredArgumentCount = 3;

// Perform an initial check to ensure a sufficient number of arguments have been provided.
if (commandLineArguments.length < requiredArgumentCount) {
    presentUsageAndTerminate("Not enough arguments supplied. At least one output column must be specified.");
}

// Extract the names of the columns that the user wishes to include in the output.
// These are typically located after the first two arguments ('node' and 'script_path').
let designatedOutputColumns = [];
for (let argIndex = 2; argIndex < commandLineArguments.length; ++argIndex) {
    designatedOutputColumns.push(commandLineArguments[argIndex]);
}

// A secondary validation to ensure that at least one valid column name was parsed.
if (designatedOutputColumns.length === 0) {
    presentUsageAndTerminate("No valid output column names could be extracted from the arguments.");
}

// --- Main Data Transformation Logic ---

// Write the header row to the output stream using the column names specified by the user.
outputDataChannel.emitRecord(designatedOutputColumns);

let processedEntryCounter = 0; // Initialize a counter for the number of records processed.

// Attach an event listener to the input data flow. This function will be invoked
// for every complete CSV record parsed from the input stream.
inputDataFlow.on('data', (incomingRecord) => {
    processedEntryCounter++; // Increment the counter for each record processed.

    // Initialize an array to store the selected field values for the current output record.
    let currentTransformedRecord = [];

    // Iterate through each designated output column.
    for (let currentColumnIdx = 0; currentColumnIdx < designatedOutputColumns.length; ++currentColumnIdx) {
        const fieldKey = designatedOutputColumns[currentColumnIdx];

        // Check if the current field key exists as a property in the incoming record.
        if (incomingRecord.hasOwnProperty(fieldKey)) {
            // If the field exists, add its value to the transformed record.
            currentTransformedRecord.push(incomingRecord[fieldKey]);
        } else {
            // If the field is missing, add an empty string to maintain the column structure.
            // This ensures that the output CSV always has the expected number of columns.
            currentTransformedRecord.push('');
        }
    }

    // Write the newly compiled, transformed record to the standard output channel.
    outputDataChannel.emitRecord(currentTransformedRecord);
});

// Attach an 'end' event listener to the input data flow. This signifies that
// all input data has been read and processed.
inputDataFlow.on('end', () => {
    // Optionally, log a completion message.
    // systemUtilities.log(`CSV processing concluded. A total of ${processedEntryCounter} entries were handled.`);
});

// Attach an 'error' event listener to handle any parsing errors that may occur
// during the processing of the input CSV data.
inputDataFlow.on('error', (parsingError) => {
    systemUtilities.error("An unrecoverable error occurred during CSV parsing:", parsingError.message);
    process.exit(1); // Terminate with an error code upon encountering a parsing error.
});