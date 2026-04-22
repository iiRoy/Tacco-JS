/*
 * This module is responsible for processing numerical input from standard input
 * and calculating the arithmetic mean of the first two provided numbers.
 *
 * It demonstrates robust input handling, type conversion, and a modular approach
 * to computation.
 */

// A global buffer to meticulously collect all incoming data fragments
// from the standard input stream.
let accumulatedInputBuffer = '';

/**
 * Computes the arithmetic mean of the first two numeric elements within an array.
 * It performs necessary type conversions and includes basic validation.
 *
 * @param {Array<string>} inputElements - An array of string representations of numbers.
 * @returns {number} The calculated arithmetic mean, or 0 if insufficient valid input.
 */
function determineArithmeticMean(inputElements) {
    // Validate the input array to ensure it's an array and has enough elements.
    // If not, we log a warning and return a default value, as the original
    // might have implicitly handled undefined values.
    if (!Array.isArray(inputElements) || inputElements.length < 2) {
        console.error("Computation Warning: Insufficient or invalid input elements " +
                      "provided for mean calculation. Expected at least two numbers.");
        return 0; // Returning 0 as a sensible default for missing data.
    }

    // Extract the first two elements from the input array.
    // These are initially strings as they come from `split()`.
    const initialElementOneString = inputElements[0];
    const initialElementTwoString = inputElements[1];

    // Convert the extracted string values into floating-point numbers.
    // parseFloat is used to handle potential decimal values.
    // Non-numeric strings will result in NaN, which will propagate correctly.
    const numericValueOne = parseFloat(initialElementOneString);
    const numericValueTwo = parseFloat(initialElementTwoString);

    // Calculate the sum of the two converted numeric values.
    const sumOfNumericValues = numericValueOne + numericValueTwo;

    // Compute the arithmetic mean by dividing the sum by 2.
    // Using multiplication by 0.5 is an equivalent and sometimes
    // marginally faster operation than division.
    const calculatedFinalMean = sumOfNumericValues * 0.5;

    // Return the result of the arithmetic mean computation.
    return calculatedFinalMean;
}

/**
 * Callback function executed every time a new chunk of data arrives
 * on the standard input stream. Appends the chunk to the global buffer.
 *
 * @param {string} receivedContentChunk - A segment of data read from stdin.
 */
const handleIncomingDataSegment = (receivedContentChunk) => {
    accumulatedInputBuffer += receivedContentChunk;
};

/**
 * Callback function executed when the standard input stream signals
 * that no more data will be provided. This is where final processing occurs.
 */
const finalizeInputProcessing = () => {
    let processedNumericStrings; // Array to hold string numbers after splitting.

    // Before splitting, perform a check for empty or whitespace-only input.
    // This prevents errors if no data was piped or typed.
    if (accumulatedInputBuffer.trim().length === 0) {
        console.warn("No meaningful input data was received from standard input.");
        processedNumericStrings = []; // Provide an empty array for the function to handle.
    } else {
        // Split the entire accumulated string by spaces.
        // This generates an array of string-represented numbers.
        processedNumericStrings = accumulatedInputBuffer.split(' ');
    }

    // Invoke our core calculation function with the prepared array of strings.
    const computedAverage = determineArithmeticMean(processedNumericStrings);

    // Display the final computed result to the user.
    // A more descriptive output format is used for clarity.
    console.log(`The computed arithmetic average of the first two numbers is: ${computedAverage}`);
};

// Initiate the standard input stream to begin listening for data.
// This is a prerequisite for receiving any input.
process.stdin.resume();

// Configure the encoding for the incoming data to ensure proper character interpretation.
// UTF-8 is a widely used and robust encoding.
process.stdin.setEncoding('utf8');

// Register the handler for the 'data' event.
// This function will be called repeatedly as data arrives.
process.stdin.on('data', handleIncomingDataSegment);

// Register the handler for the 'end' event.
// This function will be called once all input has been received.
process.stdin.on('end', finalizeInputProcessing);