// --- Global Declarations and Setup ---

// This variable will accumulate all incoming data chunks from standard input.
let inputDataBuffer = '';
// A flag to prevent the input processing function from being called multiple times
// if the 'end' event on stdin fires unexpectedly more than once.
let processingInitiated = false;

// Resume the standard input stream to start listening for data.
process.stdin.resume();
// Set the encoding for the standard input stream to UTF-8 for text data.
process.stdin.setEncoding('utf8');

// Event listener for when data chunks are received from standard input.
process.stdin.on('data', (dataChunk) => {
    // Basic validation to ensure the received chunk is a non-empty string.
    if (typeof dataChunk === 'string' && dataChunk.length > 0) {
        inputDataBuffer += dataChunk; // Append the new chunk to our buffer.
    }
});

// Event listener for when the standard input stream has ended (no more data).
process.stdin.on('end', () => {
    // Only proceed if processing hasn't been initiated yet.
    if (!processingInitiated) {
        processingInitiated = true; // Mark processing as initiated.

        // Split the accumulated buffer into individual lines using the newline character.
        // This creates an array of strings, where each string is a line from the input.
        const parsedLines = inputDataBuffer.split('\n');

        // Invoke the main function responsible for processing these input lines.
        processInputLines(parsedLines);

        // Output a final message indicating completion of input processing.
        console.log("--- All input processing complete. ---");
    }
});

// --- Core Logic Functions ---

/**
 * Computes a specific numeric sequence starting from an initial value,
 * applying alternating multiplication and division operations, and then
 * returns the sum of all elements in the generated sequence.
 *
 * The sequence generation rule:
 * - The first element is the initial value.
 * - Subsequent elements are generated iteratively:
 *   - If the iteration number (1st, 3rd, 5th, etc.) is odd, the previous element is multiplied by 2.
 *   - If the iteration number (2nd, 4th, 6th, etc.) is even, the previous element is divided by 3.
 * - A total of 9 additional elements are generated after the initial one.
 *
 * @param {number} initialVal - The starting numeric value for the sequence.
 * @returns {number} The cumulative sum of all elements in the generated sequence.
 */
function computeAlternatingSequenceSum(initialVal) {
    // Input validation: Ensure the provided initial value is a valid number.
    if (typeof initialVal !== 'number' || isNaN(initialVal)) {
        console.error("Error: computeAlternatingSequenceSum received an invalid initial value. Expected a number.");
        return 0; // Return 0 or throw an error for invalid input.
    }

    // Define the number of elements to add to the sequence after the initial value.
    // The original loop (i=2 to 10) adds 9 elements to an array that already has one.
    const numberOfAdditionalElements = 9;
    // Initialize the array with the starting value.
    const sequenceElements = [initialVal];

    // Loop to generate the subsequent elements of the sequence.
    // currentIteration starts from 1, representing the index of the element being added (relative to the initial).
    for (let currentIteration = 1; currentIteration <= numberOfAdditionalElements; currentIteration++) {
        const lastElement = sequenceElements[sequenceElements.length - 1]; // Get the last element for calculation.
        let nextCalculatedValue;

        // Apply alternating operations: multiply by 2 for odd iterations, divide by 3 for even.
        // This corresponds to the original logic where i=2 (1st added element) was *2, i=3 (2nd added element) was /3.
        nextCalculatedValue = (currentIteration % 2 === 1) // If currentIteration is odd (1, 3, 5, ...)
            ? lastElement * 2                            //  Multiply by 2
            : lastElement / 3;                           //  Else (currentIteration is even: 2, 4, 6, ...), divide by 3

        sequenceElements.push(nextCalculatedValue); // Add the newly calculated value to the sequence.
    }

    // Guard against an empty sequence, although unlikely with the current logic.
    if (sequenceElements.length === 0) {
        return 0;
    }

    // Calculate the sum of all elements in the sequence using the reduce method.
    // The initial value for the accumulator is set to 0.
    const totalSumOfSequence = sequenceElements.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    return totalSumOfSequence;
}

/**
 * Iterates through an array of string lines, processes each line by
 * attempting to parse it as a number, and then applies a custom calculation
 * before logging the result. Skips empty or non-numeric lines.
 *
 * @param {string[]} linesArray - An array of string lines obtained from the input.
 */
function processInputLines(linesArray) {
    // Early exit if the input array is null, undefined, or empty.
    if (!linesArray || linesArray.length === 0) {
        console.warn("Notice: No input lines were provided for processing.");
        return;
    }

    let validNumericInputsProcessed = 0; // Counter for successfully processed numeric inputs.

    // Iterate over each line in the provided array.
    // Using a 'for...of' loop as an alternative to 'forEach' for demonstration.
    for (const currentLine of linesArray) {
        // Remove leading/trailing whitespace from the current line.
        const cleanedLine = currentLine.trim();

        // Skip lines that are empty or consist only of whitespace after trimming.
        if (cleanedLine === '') {
            continue; // Move to the next line without further processing.
        }

        // Attempt to convert the cleaned line string into a floating-point number.
        const parsedNumericValue = parseFloat(cleanedLine);

        // Validate if the parsing was successful (i.e., not NaN - Not a Number).
        if (isNaN(parsedNumericValue)) {
            console.error(`Skipping invalid input: "${cleanedLine}" could not be converted to a number.`);
            continue; // Skip this line and proceed to the next.
        }

        // Increment the counter for valid inputs.
        validNumericInputsProcessed++;

        // Call the helper function to perform the core calculation on the parsed number.
        const resultOfCalculation = computeAlternatingSequenceSum(parsedNumericValue);

        // Output the result to the console in a more descriptive format,
        // formatting the numeric output to 4 decimal places for consistency.
        console.log(`Input: '${cleanedLine}' => Sequence Sum: ${resultOfCalculation.toFixed(4)}`);
    }

    // Provide a summary of the processing.
    if (validNumericInputsProcessed > 0) {
        console.log(`Summary: Successfully processed ${validNumericInputsProcessed} valid numeric inputs.`);
    } else {
        console.log("Summary: No valid numeric inputs were found or processed from the provided lines.");
    }
}