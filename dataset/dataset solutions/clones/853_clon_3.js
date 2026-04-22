const fileSystemModule = require('fs'); // Import the Node.js file system module

/**
 * Reads and preprocesses input data from a specified file path.
 * Handles initial parsing and basic validation of the input structure.
 * @param {string} sourceFilePath - The path to the input file (e.g., '/dev/stdin').
 * @returns {{dataItemCount: number, recordLines: string[]}} An object containing the count of data items and an array of data record lines.
 */
const acquireAndPrepareInput = (sourceFilePath) => {
    try {
        // Attempt to read the entire file content as a UTF-8 string
        const rawFileContent = fileSystemModule.readFileSync(sourceFilePath, 'utf8');

        // Trim any leading/trailing whitespace and split the content into an array of lines
        const allContentLines = rawFileContent.trim().split('\n');

        // Extract the first line, which is expected to be the total number of data entries.
        // Use Number() for explicit type conversion from string to number.
        const totalExpectedDataItems = Number(allContentLines.shift());

        // Implement a guard clause for invalid or negative data item counts
        if (isNaN(totalExpectedDataItems) || totalExpectedDataItems < 0) {
            console.error("Input processing error: The first line must be a non-negative number indicating data item count.");
            process.exit(1); // Terminate the process due to critical input error
        }

        // Return the parsed count and the remaining lines (the actual data records)
        return { dataItemCount: totalExpectedDataItems, recordLines: allContentLines };

    } catch (fileReadError) {
        // Catch and report any errors during file reading
        console.error("Critical input error: Could not read from the specified source path.", fileReadError.message);
        process.exit(1); // Terminate the process
    }
};

// Define the standard input path
const standardInputEndpoint = '/dev/stdin';

// Execute the input acquisition function
const { dataItemCount: totalInputLinesToProcess, recordLines: rawInputRecords } = acquireAndPrepareInput(standardInputEndpoint);

// This array will store the processed and aggregated sequence of tokens.
// Its structure will be a flat array like [symbol1, aggregatedValue1, symbol2, aggregatedValue2, ...]
const processedTokenStream = [];
let lastObservedSymbol = null; // Variable to keep track of the symbol from the previous record

// Iterate through each input record to build the aggregated token stream
for (let currentLineIndex = 0; currentLineIndex < totalInputLinesToProcess; currentLineIndex++) {
    // Split the current record line by space to separate the symbol and its numeric value
    const lineComponents = rawInputRecords[currentLineIndex].split(' ');

    // Basic validation: ensure each line has at least two components
    if (lineComponents.length < 2) {
        console.error(`Data parsing error: Malformed record encountered at line ${currentLineIndex + 1}. Expected "SYMBOL VALUE", got "${rawInputRecords[currentLineIndex]}".`);
        process.exit(1);
    }

    const currentSymbolToken = lineComponents[0]; // The first component is the symbol (e.g., '(', ')')
    // Convert the second component to a number. Using Number() explicitly for clarity and error handling.
    const currentNumericQuantity = Number(lineComponents[1]);

    // Validate that the second component is indeed a valid number
    if (isNaN(currentNumericQuantity)) {
        console.error(`Data parsing error: Non-numeric value found at line ${currentLineIndex + 1}. Expected a number, got "${lineComponents[1]}".`);
        process.exit(1);
    }

    // Logic for aggregating numeric quantities for consecutive identical symbols
    if (lastObservedSymbol === currentSymbolToken) {
        // If the current symbol matches the last observed symbol, add the quantity
        // to the last numeric value pushed into the token stream.
        if (processedTokenStream.length > 0 && typeof processedTokenStream[processedTokenStream.length - 1] === 'number') {
            processedTokenStream[processedTokenStream.length - 1] += currentNumericQuantity;
        } else {
            // This scenario indicates a potential logic error or unexpected input state.
            console.error("Aggregation logic error: Attempted to aggregate into an empty or non-numeric last token.");
            process.exit(1);
        }
    } else {
        // If the symbol has changed, push both the new symbol and its quantity as new entries
        processedTokenStream.push(currentSymbolToken);
        processedTokenStream.push(currentNumericQuantity);
        // Update the last observed symbol for the next iteration
        lastObservedSymbol = currentSymbolToken;
    }
}

// --- Part 2: Sequence Pattern Validation ---

// Define the expected block size for validation (e.g., '(', value, ')', value)
const validationBlockSize = 4;

// Early exit validation: The total length of the token stream must be a multiple of the block size
if (processedTokenStream.length % validationBlockSize !== 0) {
    console.log("NO"); // Output "NO" and terminate as the sequence structure is fundamentally incorrect
    process.exit(0);
}

let overallSequenceValidity = true; // Flag to track if the entire sequence conforms to the rules

// Iterate through the processed token stream, checking each block of 4 elements
for (let blockStartIndex = 0; blockStartIndex < processedTokenStream.length; blockStartIndex += validationBlockSize) {
    // Extract the four elements of the current validation block
    const blockCharOne = processedTokenStream[blockStartIndex];
    const blockNumValOne = processedTokenStream[blockStartIndex + 1];
    const blockCharTwo = processedTokenStream[blockStartIndex + 2];
    const blockNumValTwo = processedTokenStream[blockStartIndex + 3];

    // Validation rule 1: The first character of the block must be an opening parenthesis
    if (blockCharOne !== '(') {
        overallSequenceValidity = false;
        break; // Stop validation on the first failure
    }

    // Validation rule 2: The second character of the block must be a closing parenthesis
    if (blockCharTwo !== ')') {
        overallSequenceValidity = false;
        break;
    }

    // Validation rule 3: The two numeric values within the block must be identical
    // Ensure robust comparison by explicitly converting to Number, though they should already be numbers.
    if (Number(blockNumValOne) !== Number(blockNumValTwo)) {
        overallSequenceValidity = false;
        break;
    }

    // Additional type check: Ensure the values are indeed numbers
    if (typeof blockNumValOne !== 'number' || typeof blockNumValTwo !== 'number') {
        overallSequenceValidity = false;
        break;
    }
}

// Output the final result based on the overall sequence validity flag
if (overallSequenceValidity) {
    console.log("YES");
} else {
    console.log("NO");
}