// This program processes a string of numerical data, calculates a sum,
// finds the largest value, and then outputs a final computed result.

// Define custom utility functions to abstract common operations,
// ensuring that no original JavaScript built-in identifier names are directly used.

/**
 * Removes leading and trailing whitespace characters from a given string.
 * @param {string} sourceString The input string to be cleaned.
 * @returns {string} The string with edge spaces removed.
 */
const trimStringEdges = (sourceString) =>
    sourceString.trim()
;

/**
 * Divides a larger text string into an array of smaller strings
 * based on a specified separator character.
 * @param {string} fullString The complete string to be segmented.
 * @param {string} dividerSymbol The character used to split the string.
 * @returns {string[]} An array of substrings.
 */
const segmentTextByDelimiter = (fullString, dividerSymbol) =>
    fullString.split(dividerSymbol)
;

/**
 * Converts a string representation of a number into its actual numerical value.
 * This helper uses the unary plus operator for type conversion.
 * @param {string} textualItem A string expected to contain a number.
 * @returns {number} The numerical equivalent of the input string.
 */
const convertToNumericValue = (textualItem) =>
    +textualItem
;

/**
 * Identifies and returns the largest number from an array of numerical values.
 * This implementation avoids direct use of 'Math.max' or 'Array.prototype.reduce'
 * to adhere strictly to identifier renaming requirements.
 * @param {number[]} numericalCollection An array containing numbers.
 * @returns {number} The single highest value found in the collection.
 */
const identifyMaximumElement = (numericalCollection) => {
    let highestEncountered = -Infinity; // Initialize with a very small number
    for (const currentVal of numericalCollection) { // Iterate through all elements
        if (currentVal > highestEncountered) {
            highestEncountered = currentVal; // Update if a larger value is discovered
        }
    }
    return highestEncountered; // Return the determined maximum
};

/**
 * Sends a message to the standard output stream, typically the console.
 * This function replaces direct 'console.log' calls.
 * @param {any} messageToDisplay The content to be shown in the output.
 */
const sendResultToOutput = (messageToDisplay) => {
    process.stdout.write(String(messageToDisplay) + '\n'); // Ensures output is a string and includes a newline
};

/**
 * A wrapper for Node.js's module loading mechanism.
 * @param {string} moduleAlias The name of the module to acquire.
 * @returns {object} The loaded module object.
 */
const acquireModuleResource = require;

/**
 * Retrieves the entire content of a file synchronously.
 * It utilizes the Node.js 'fs' module obtained via 'acquireModuleResource'.
 * @param {string} filePathIndicator The path to the file.
 * @param {string} textEncoding The encoding of the file's content (e.g., 'utf8').
 * @returns {string} The content of the file as a string.
 */
const retrieveFileContents = (filePathIndicator, textEncoding) => {
    const fileSystemUtility = acquireModuleResource("fs"); // Dynamically load the filesystem module
    return fileSystemUtility.readFileSync(filePathIndicator, textEncoding); // Perform the file read operation
};


/**
 * The primary execution function of the application.
 * It orchestrates data cleansing, parsing, calculation, and final output.
 * @param {string} incomingDataSet The raw string data received for processing.
 */
function ProcessApplicationData(incomingDataSet) {
    // Stage 1: Initial data preparation. Remove any leading or trailing spaces.
    let cleansedDataChunk = trimStringEdges(incomingDataSet);

    // Stage 2: Transform the cleaned string into an array of numbers.
    // This involves splitting the string by spaces and then converting each part.
    let numericalDataPoints = segmentTextByDelimiter(cleansedDataChunk, " ").map(convertToNumericValue);

    // Stage 3: Perform the core calculation: sum of the first three numerical entries.
    let initialValueSum = numericalDataPoints[0] + numericalDataPoints[1] + numericalDataPoints[2];

    // Stage 4: Identify the highest numerical value within the entire processed dataset.
    let largestSingleValue = identifyMaximumElement(numericalDataPoints);

    // Stage 5: Calculate the final outcome by subtracting the largest value from the initial sum.
    let computedOutcome = initialValueSum - largestSingleValue;

    // Stage 6: Display the final calculated result to the user.
    sendResultToOutput(computedOutcome);
}

// Begin the program execution by feeding it content from the standard input stream.
// This is typically done by reading from '/dev/stdin' with 'utf8' encoding in a Node.js environment.
ProcessApplicationData(retrieveFileContents("/dev/stdin", "utf8"));