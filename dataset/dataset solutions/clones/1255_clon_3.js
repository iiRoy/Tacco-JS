// Initialize the standard input stream to be resumable.
process.stdin.resume();

// Define the character encoding for data received from standard input.
process.stdin.setEncoding('utf8');

/**
 * A utility function to safely convert a string to a number.
 * Throws an error if the conversion results in NaN.
 * @param {string} inputString - The string to convert.
 * @returns {number} The converted numeric value.
 * @throws {Error} If the input string cannot be parsed as a number.
 */
const convertToNumber = (inputString) => {
    const numericResult = +inputString; // Unary plus operator for type coercion
    if (Number.isNaN(numericResult)) {
        throw new Error(`Data format error: Cannot parse "${inputString}" as a valid number.`);
    }
    return numericResult;
};

/**
 * Event listener for incoming data chunks from standard input.
 * This function processes the input to calculate the minimum, maximum, and sum
 * of a sequence of integers provided across two lines.
 *
 * The expected input format is:
 * Line 1: An integer representing the count of numbers to follow.
 * Line 2: A space-separated string of integers.
 *
 * @param {string | Buffer} receivedData - The data chunk from stdin.
 */
process.stdin.on('data', (receivedData) => {
    // Convert the received data to a string, trim any leading/trailing whitespace,
    // then split it into an array of lines. Filter out any lines that are empty
    // after trimming, ensuring only meaningful lines are processed.
    const processedLines = String(receivedData)
        .trim()
        .split('\n')
        .filter(lineEntry => lineEntry.trim().length > 0);

    // Guard clause: Ensure there are at least two lines of input (count and numbers).
    if (processedLines.length < 2) {
        console.error("Input error: Not enough lines provided. Expected at least two lines.");
        return; // Halt further processing for this data chunk.
    }

    let expectedQuantity;
    try {
        // Parse the first line to get the expected count of numbers.
        expectedQuantity = convertToNumber(processedLines[0]);
    } catch (parseErr) {
        console.error(`Input error on line 1: ${parseErr.message}`);
        return;
    }

    // Split the second line by spaces to get an array of number strings.
    // Filter out any empty strings that might result from multiple spaces.
    const rawNumberStrings = processedLines[1].split(' ').filter(str => str.length > 0);

    // Map the array of number strings to actual numeric values.
    // Use a try-catch block for robustness in case of invalid number strings.
    let parsedNumericValues;
    try {
        parsedNumericValues = rawNumberStrings.map(convertToNumber);
    } catch (parseErr) {
        console.error(`Input error on line 2: ${parseErr.message}`);
        return;
    }

    // Informative warning if the actual number of values doesn't match the expected quantity.
    if (parsedNumericValues.length !== expectedQuantity) {
        console.warn(`Warning: Declared count was ${expectedQuantity}, but ${parsedNumericValues.length} numbers were found.`);
        // For this Type III clone, we'll proceed with the numbers actually found.
    }

    // Guard clause: If no valid numbers were parsed, there's nothing to compute.
    if (parsedNumericValues.length === 0) {
        console.log("No valid numbers found for processing.");
        return;
    }

    // Initialize variables for minimum, maximum, and sum.
    // Initialize min to positive infinity and max to negative infinity to ensure
    // any valid number will correctly set the initial min/max.
    let currentMinimum = Number.POSITIVE_INFINITY;
    let currentMaximum = Number.NEGATIVE_INFINITY;
    let runningTotal = 0;

    // Iterate through each numeric value to update the statistics.
    // Using a 'for...of' loop for clear iteration over array elements.
    for (const value of parsedNumericValues) {
        currentMinimum = Math.min(currentMinimum, value);
        currentMaximum = Math.max(currentMaximum, value);
        runningTotal += value;
    }

    // Output the results using a template literal for clear string concatenation.
    console.log(`${currentMinimum} ${currentMaximum} ${runningTotal}`);
});

// Optional: Add an error handler for the standard input stream itself.
process.stdin.on('error', (streamError) => {
    console.error('An unhandled error occurred with the standard input stream:', streamError);
});