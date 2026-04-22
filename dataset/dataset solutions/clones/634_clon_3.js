const processInputData = () => {
    // Acquire the total number of rows (N) that need to be processed from the input.
    const totalRows = readInputToken('number');
    // Acquire the total number of columns (M) expected in each row's string data.
    const totalCols = readInputToken('number');

    // Initiate a loop to process each row of input based on the 'totalRows' count.
    iterateNTimes(totalRows, (rowIndex) => {
        // Read the string data for the current row being processed.
        const currentLineString = readInputToken('string');

        // This array will store the calculated distances for each character in the current row.
        const computedDistances = [];
        // A variable to keep track of the distance from the most recently encountered 'c' character.
        // Initialized to -1, indicating no 'c' has been found yet in the current row.
        let distanceTracker = -1;

        // Add a guard clause for potentially empty or invalid input strings.
        if (!currentLineString || currentLineString.length === 0) {
            // If the string is empty or invalid, populate the distances array with -1s
            // for all columns to maintain output consistency.
            for (let k = 0; k < totalCols; k++) {
                computedDistances.push(-1);
            }
            outputResult(computedDistances.join(' ')); // Output the row of -1s
            return; // Skip further processing for this row and move to the next.
        }

        // Iterate through each character in the current line string, up to 'totalCols'.
        for (let colIndex = 0; colIndex < totalCols; ++colIndex) {
            // Extract the character at the current column index.
            const currentChar = currentLineString[colIndex];

            // Check if the current character matches our target character 'c'.
            if (currentChar === 'c') {
                computedDistances.push(0); // If it's 'c', its distance to itself is 0.
                distanceTracker = 1;      // Reset the distance tracker for subsequent characters.
            } else {
                // If the character is not 'c', calculate its distance from the last 'c'.
                if (distanceTracker !== -1) {
                    computedDistances.push(distanceTracker); // Add the current distance to the array.
                    distanceTracker = distanceTracker + 1;   // Increment the tracker for the next character.
                } else {
                    computedDistances.push(-1); // If no 'c' has been encountered yet, output -1.
                }
            }
        }
        // Once all characters in the row are processed, output the space-separated distances.
        outputResult(computedDistances.join(' '));
    });
};

// A generalized utility function to iterate a specific number of times and execute a callback.
const iterateNTimes = (count, operationCallback) => {
    // Robustness check: ensure the 'count' is a valid positive number.
    if (typeof count !== 'number' || count < 0) {
        console.error("Error: Invalid iteration count provided. Expected a non-negative number, got:", count);
        return; // Prevent execution with invalid input.
    }

    // Loop from 0 up to (but not including) 'count', executing the callback for each iteration.
    for (let currentIterationIndex = 0; currentIterationIndex < count; currentIterationIndex++) {
        // Execute the provided callback function, passing the current iteration index.
        operationCallback(currentIterationIndex);
    }
};

// --- Global variables for managing buffered input stream ---
let bufferedInput = ''; // Stores all incoming data from stdin.
let currentReadPointer = 0; // Tracks the current position within the 'bufferedInput' array.

// A helper function designed to read the next token from the pre-processed input buffer.
const readInputToken = (expectedTokenType) => {
    // Pre-check: Ensure the read pointer has not exceeded the bounds of the input array.
    if (currentReadPointer >= bufferedInput.length) {
        console.warn("Warning: Attempted to read beyond the end of the input buffer. Returning null.");
        return null; // Indicate failure to read a token.
    }

    // Retrieve the next token from the buffer and advance the pointer.
    const nextToken = bufferedInput[currentReadPointer];
    currentReadPointer = currentReadPointer + 1; // Increment pointer using explicit addition.

    // Conditional logic to handle different expected token types.
    if (expectedTokenType === 'string') {
        return String(nextToken); // Explicitly convert to string.
    } else if (expectedTokenType === 'number') {
        const parsedNumber = parseInt(nextToken, 10); // Parse as an integer (base 10).
        // Validate if parsing was successful.
        if (isNaN(parsedNumber)) {
            console.error("Error: Failed to parse token as a number. Value was:", nextToken);
            return null; // Return null on parsing failure.
        }
        return parsedNumber;
    } else {
        // Default behavior: if no specific type is requested or type is unknown, treat as string.
        console.warn(`Warning: Unknown token type '${expectedTokenType}' requested. Defaulting to string.`);
        return String(nextToken);
    }
};

// A helper function to manage outputting results to the console.
const outputResult = (valueToOutput) => {
    // Add a basic validation for null or undefined values to prevent unexpected output.
    if (valueToOutput === null || typeof valueToOutput === 'undefined') {
        console.warn("Warning: Attempted to output a null or undefined value. Outputting an empty line.");
        console.log(''); // Output an empty line for clarity.
        return;
    }

    // If the value is an array, assume it needs to be joined by spaces before logging.
    if (Array.isArray(valueToOutput)) {
        console.log(valueToOutput.join(' '));
    } else {
        // For all other types, ensure it's converted to a string before logging.
        console.log(String(valueToOutput));
    }
};

// --- Core Node.js process input/output stream setup ---

// Explicitly resume the standard input stream to begin receiving data.
process.stdin.resume();
// Set the character encoding for the incoming data to 'utf8'.
process.stdin.setEncoding('utf8');

// Event listener: 'data' event fires when new data chunks are available from stdin.
process.stdin.on('data', (dataChunk) => {
    bufferedInput += dataChunk; // Append the new data chunk to our buffer.
});

// Event listener: 'end' event fires when the standard input stream has closed.
process.stdin.on('end', () => {
    // Once all input is received, perform pre-processing on the buffered data:
    // 1. Convert to string (ensuring type safety).
    // 2. Trim leading/trailing whitespace.
    // 3. Split the string into an array of tokens using any whitespace as a delimiter.
    // 4. Filter out any empty strings that might result from splitting (e.g., multiple spaces).
    bufferedInput = String(bufferedInput).trim().split(/\s+/).filter(token => token.length > 0);

    // After all input is prepared, initiate the main data processing logic.
    processInputData();
});

// Optional: Add an error handler for the standard input stream to catch potential issues.
process.stdin.on('error', (err) => {
    console.error("Fatal Error: An unhandled error occurred while reading from stdin:", err);
    process.exit(1); // Exit the process with an error code.
});