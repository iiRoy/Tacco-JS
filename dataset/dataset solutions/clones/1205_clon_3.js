// Activate the standard input stream to begin receiving data.
// This ensures that the process doesn't exit prematurely while waiting for input.
process.stdin.resume();

// Define a constant for the desired input character encoding.
const STREAM_INPUT_ENCODING = 'utf8';

// Specify the numerical base for parsing integers, ensuring decimal interpretation.
const INTEGER_PARSE_RADIX = 10;

// Regular expression to split input by one or more whitespace characters,
// making the input parsing more flexible than just a single space.
const INPUT_SPLIT_REGEX = /\s+/;

// A counter to keep track of how many data chunks have been processed.
let inputEventCounter = 0;

/**
 * Robustly parses a string into an integer, including validation for non-numeric input.
 * @param {string} inputStringValue - The string representation of the number.
 * @returns {number} The successfully parsed integer.
 * @throws {Error} If the input string cannot be converted to a valid integer.
 */
function retrieveValidInteger(inputStringValue) {
    const parsedNumber = Number.parseInt(inputStringValue, INTEGER_PARSE_RADIX);
    // Check if the parsing resulted in a 'Not a Number' value.
    if (Number.isNaN(parsedNumber)) {
        throw new Error(`Input value '${inputStringValue}' is not a valid integer.`);
    }
    return parsedNumber;
}

/**
 * Calculates the area and perimeter for a rectangular shape given its two side lengths.
 * @param {number} sideLengthA - The length of the first side.
 * @param {number} sideLengthB - The length of the second side.
 * @returns {{computedArea: number, computedPerimeter: number}} An object containing both calculated values.
 */
function calculateRectangleMetrics(sideLengthA, sideLengthB) {
    const computedArea = sideLengthA * sideLengthB;
    const computedPerimeter = (sideLengthA + sideLengthB) * 2; // Equivalent to 2*A + 2*B
    return { computedArea, computedPerimeter };
}

// Configure the standard input stream to interpret incoming bytes as UTF-8 characters.
process.stdin.setEncoding(STREAM_INPUT_ENCODING);

// Set up an event listener to react whenever new data is available on the standard input.
process.stdin.on('data', (incomingDataChunk) => {
    inputEventCounter++; // Increment the counter for each data event.

    // Basic type validation: ensure the received data is indeed a string.
    if (typeof incomingDataChunk !== 'string') {
        console.error(`[Error ${inputEventCounter}] Received unexpected non-string data type.`);
        return; // Skip processing this invalid data chunk.
    }

    // Clean and tokenize the input string.
    // Trim whitespace from both ends and split by the defined regex,
    // then filter out any empty strings that might result from multiple delimiters.
    const cleanedInput = incomingDataChunk.trim();
    const tokenizedInput = cleanedInput.split(INPUT_SPLIT_REGEX).filter(token => token.length > 0);

    // Validate the number of expected input tokens.
    const REQUIRED_TOKEN_COUNT = 2;
    if (tokenizedInput.length !== REQUIRED_TOKEN_COUNT) {
        console.error(`[Error ${inputEventCounter}] Invalid input format. Expected ${REQUIRED_TOKEN_COUNT} numeric values, but found ${tokenizedInput.length}. Raw input: '${cleanedInput}'`);
        return; // Halt processing for malformed input.
    }

    let dimensionOne, dimensionTwo;
    try {
        // Attempt to parse the two dimensions from the tokenized input.
        dimensionOne = retrieveValidInteger(tokenizedInput[0]);
        dimensionTwo = retrieveValidInteger(tokenizedInput[1]);
    } catch (parsingException) {
        // Catch and report any errors encountered during the integer parsing phase.
        console.error(`[Error ${inputEventCounter}] Data parsing failed for input '${cleanedInput}': ${parsingException.message}`);
        return; // Stop if parsing of either dimension fails.
    }

    // Execute the core calculation logic using the parsed dimensions.
    const calculationResult = calculateRectangleMetrics(dimensionOne, dimensionTwo);

    // Construct the final output string using a template literal for clarity.
    const finalOutputString = `${calculationResult.computedArea} ${calculationResult.computedPerimeter}`;

    // Print the results to the standard output.
    console.log(finalOutputString);
});

// Attach an error handler for the input stream to gracefully manage unexpected issues.
process.stdin.on('error', (streamError) => {
    console.error(`A critical error occurred on the input stream: ${streamError.message}`);
    // Optionally, perform cleanup or exit the process if the error is unrecoverable.
    process.exit(1);
});

// Add an 'end' handler to be notified when the input stream closes.
process.stdin.on('end', () => {
    console.warn(`Input stream has concluded. Total data chunks processed: ${inputEventCounter}.`);
});