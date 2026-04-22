// Import the Node.js file system module for performing I/O operations.
const fileSystemInterface = require('fs');

// Define the standardized path for reading input, typically standard input in Unix-like systems.
const sourceInputPath = '/dev/stdin';

// Read the entire content from the specified input path as a string, using UTF-8 encoding.
// The content is initially stored in a mutable variable for subsequent processing.
let rawInputData = fileSystemInterface.readFileSync(sourceInputPath, 'utf8');

// Prepare the input data:
// 1. Remove any leading or trailing whitespace from the raw content.
// 2. Split the cleaned content into an array of strings, where each element represents a line.
// This array will serve as a dynamic buffer from which lines are consumed.
let inputLineBuffer = rawInputData.trim().split("\n");

// A control flag to manage the execution flow of the primary processing loop.
// The loop will continue as long as this flag remains true.
let processingIsActive = true;

// Initiate the core processing loop. This loop will iterate, consuming input lines,
// until an explicit termination condition is met or the input buffer is exhausted.
do {
    // Pre-check: Ensure there are still lines available in the buffer before attempting to read.
    // This guard prevents errors if the input ends unexpectedly.
    if (inputLineBuffer.length === 0) {
        // If the buffer is empty, it indicates an unexpected end of input.
        // We set the flag to false to terminate the loop gracefully.
        processingIsActive = false;
        continue; // Skip to the loop condition check.
    }

    // Extract the next control line from the beginning of the buffer.
    // The `shift()` method removes the first element and returns it.
    const currentControlEntry = inputLineBuffer.shift();

    // Validate that a line was successfully retrieved.
    // If `currentControlEntry` is undefined or null, it implies an issue with `shift()`.
    if (!currentControlEntry) {
        // Log an error or warning if a line could not be read, then prepare to exit.
        processingIsActive = false;
        continue;
    }

    // Split the control line into individual string components based on space delimiters.
    const entryComponents = currentControlEntry.split(" ");

    // Perform a structural validation: ensure the control line contains at least two parts.
    // This is crucial as we expect two numeric parameters.
    if (entryComponents.length < 2) {
        // If the format is incorrect, log a message and halt processing.
        processingIsActive = false;
        continue;
    }

    // Parse the first two components into numeric values.
    // The first value (`valueM`) is read but its functionality is not utilized in the subsequent logic,
    // mirroring the behavior of the original code where `mn[0]` was unused.
    const valueM = Number(entryComponents[0]);
    const valueN = Number(entryComponents[1]);

    // Encapsulate the parsed parameters into an object for better readability and structure.
    const parsedParameters = {
        m_identifier: valueM, // Represents the 'M' value from the input.
        n_identifier: valueN  // Represents the 'N' value from the input.
    };

    // Determine if the current set of parameters signals the termination of the program.
    // The termination condition is when both 'M' and 'N' values are zero.
    const isProgramTerminationSignal = (parsedParameters.m_identifier === 0 && parsedParameters.n_identifier === 0);

    if (isProgramTerminationSignal) {
        // If the termination signal is detected, set the flag to false to exit the do-while loop.
        processingIsActive = false;
    } else {
        // If it's not a termination signal, proceed with discarding subsequent lines.
        // The `m_identifier` (M value) is present but does not influence the line discarding process.

        let linesToDiscard = parsedParameters.n_identifier; // Number of lines to remove from the buffer.
        let discardIteration = 0; // Counter for the lines being discarded.

        // Loop to sequentially remove the specified number of lines.
        // This effectively skips 'N' data lines following the current control line.
        while (discardIteration < linesToDiscard) {
            // Crucial safeguard: check if the buffer is empty before attempting another `shift()`.
            // This prevents errors if the input ends prematurely, or if 'N' is larger than remaining lines.
            if (inputLineBuffer.length === 0) {
                // If the buffer runs out, break early from the discard loop.
                break;
            }
            inputLineBuffer.shift(); // Remove one line from the buffer.
            discardIteration++; // Increment the counter.
        }
    }

} while (processingIsActive); // The loop continues as long as `processingIsActive` is true.

// The program successfully completes its execution after the main loop terminates.