// Helper function to safely extract and parse an integer from a specific line of the input array.
// It also handles potential edge cases like empty lines or non-numeric content by returning 0.
const getNextInteger = (sourceArray, currentIndex) => {
    // Ensure the requested index is within the bounds of the array to prevent errors.
    if (currentIndex >= sourceArray.length || sourceArray[currentIndex] === undefined) {
        return 0; // Return 0 if index is out of bounds or line is undefined, signaling end or invalid input.
    }
    // Trim whitespace from the line and parse it as a base-10 integer.
    const parsedValue = parseInt(sourceArray[currentIndex].trim(), 10);
    // If parsing results in NaN (Not-a-Number), treat it as 0 to maintain flow.
    return isNaN(parsedValue) ? 0 : parsedValue;
};

// Utility function to parse a string containing space-separated numeric values into an array of floats.
// It includes robust error handling for empty strings, multiple spaces, and non-numeric tokens.
const parseNumericLine = (lineString) => {
    // If the line is null, undefined, or empty, return an empty array immediately.
    if (!lineString) {
        return [];
    }
    // Trim leading/trailing whitespace, then split the string by one or more whitespace characters.
    const rawNumberStrings = lineString.trim().split(/\s+/);
    
    // Filter out any empty strings that might result from splitting (e.g., "1  2" -> ["1", "", "2"]).
    // Then, map each valid string to a floating-point number.
    const numericArray = rawNumberStrings
        .filter(s => s.length > 0) // Ensure string is not empty before parsing.
        .map(s => parseFloat(s));
    
    // Finally, filter out any NaN values that might have resulted from parseFloat on non-numeric strings.
    return numericArray.filter(n => !isNaN(n));
};

/**
 * Main function responsible for processing a collection of input lines.
 * It reads data sets one by one, calculates their standard deviation, and outputs the result.
 * Each data set begins with a count, followed by a line of numbers. A count of 0 terminates processing.
 * @param {string[]} inputRows An array where each element is a line of input.
 */
function processInputData(inputRows) {
    let lineCursor = 0; // This cursor tracks the current line being processed in `inputRows`.

    // The main processing loop continues indefinitely until explicitly broken.
    for (;;) {
        // Attempt to read the count of items for the current data set.
        // The cursor is advanced immediately after reading this line.
        const currentCaseCount = getNextInteger(inputRows, lineCursor);
        lineCursor++; 

        // Termination condition: If the count is 0, or if we've run out of input lines,
        // exit the processing loop.
        if (currentCaseCount === 0 || lineCursor >= inputRows.length) {
            break; 
        }

        // Read the line containing the actual numeric values for the current test case.
        // The cursor is advanced again after consuming this line.
        const numericValues = parseNumericLine(inputRows[lineCursor]);
        lineCursor++; 

        // --- Statistical Calculation Block ---

        // Guard clause: If no valid numbers were successfully parsed for this case,
        // output "0.000000" and skip to the next test case to prevent division by zero or errors.
        if (numericValues.length === 0) {
            console.log("0.000000"); 
            continue; // Proceed to the next iteration of the loop.
        }

        // Step 1: Calculate the sum of all numeric values.
        let totalSum = 0;
        for (const val of numericValues) {
            totalSum += val;
        }

        // Step 2: Calculate the arithmetic mean (average) of the values.
        const meanValue = totalSum / numericValues.length;

        // Step 3: Calculate the sum of squared differences from the mean.
        // This is a crucial intermediate step for variance calculation.
        let sumSquaredDifferences = 0;
        for (const val of numericValues) {
            const differenceFromMean = val - meanValue;
            sumSquaredDifferences += differenceFromMean * differenceFromMean; // Using multiplication for squaring.
        }

        // Step 4: Calculate the variance, which is the average of the squared differences.
        const dataSpread = sumSquaredDifferences / numericValues.length;

        // Step 5: Calculate the standard deviation by taking the square root of the variance.
        // Using Math.pow(x, 0.5) as an alternative to Math.sqrt(x).
        const stdDevResult = Math.pow(dataSpread, 0.5);

        // Output the final standard deviation, formatted to exactly six decimal places.
        console.log(stdDevResult.toFixed(6));
    }
}

// --- Input Handling Mechanism ---

// An array to buffer all incoming data chunks from the standard input stream.
const dataBuffer = []; 

// Set up an event listener for 'data' events on the standard input stream.
// Each time a chunk of data is received, it's appended to our buffer.
process.stdin.on('data', (inputSegment) => {
    dataBuffer.push(inputSegment); 
});

// Set up an event listener for the 'end' event on the standard input stream.
// This signifies that all input has been received.
process.stdin.on('end', () => {
    // Once all data chunks are collected, join them into a single string.
    // Then, split this string into an array of lines using the newline character as a delimiter.
    const collectedInputLines = dataBuffer.join('').split('\n');
    // Invoke our main processing function with the prepared array of input lines.
    processInputData(collectedInputLines);
});

// Optional: Add an error handler for standard input stream for robustness.
process.stdin.on('error', (err) => {
    console.error('An error occurred while reading from standard input:', err);
    process.exit(1); // Exit the process with an error code.
});