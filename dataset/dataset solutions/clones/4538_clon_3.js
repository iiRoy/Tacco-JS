// Helper function for robust integer parsing and validation.
// It ensures that the value is a valid integer and handles potential non-numeric inputs gracefully.
const parseNumericValueSafely = (textualInput, fallbackValue = NaN) => {
    // Check if the input string is null, undefined, or just whitespace.
    if (textualInput === null || typeof textualInput === 'undefined' || textualInput.trim() === '') {
        return fallbackValue;
    }

    // Use Number() for a stricter conversion than parseInt, then check if it's an integer.
    const convertedNumber = Number(textualInput);

    // Validate if the conversion resulted in a valid number and if it's an integer.
    if (isNaN(convertedNumber) || !Number.isInteger(convertedNumber)) {
        return fallbackValue;
    }

    return convertedNumber;
};

// Core logic processing function. It takes the raw text input and performs the arithmetic check.
function executeSummationLogic(rawInputStream) {
    // Define configuration constants for the operation.
    const SUM_UPPER_BOUND = 9;
    const BOUND_EXCEEDED_MESSAGE = "Input processing error";
    const GENERAL_INPUT_ISSUE_MESSAGE = "Invalid data format or missing input";

    let outputResult = ''; // Initialize a variable to hold the message to be printed.

    // Step 1: Validate and pre-process the incoming data string.
    // Ensure the input is a non-empty string before proceeding.
    if (!rawInputStream || typeof rawInputStream !== 'string' || rawInputStream.trim().length === 0) {
        outputResult = GENERAL_INPUT_ISSUE_MESSAGE;
        console.log(outputResult); // Log the error and exit the function.
        return;
    }

    // Break down the raw input into an array of individual lines.
    const dataLinesCollection = rawInputStream.trim().split('\n');

    // Guard clause: Check if there's at least one line to process.
    if (dataLinesCollection.length === 0) {
        outputResult = GENERAL_INPUT_ISSUE_MESSAGE;
        console.log(outputResult);
        return;
    }

    // Extract the primary line, typically the first one, for our number operation.
    const targetDataLine = dataLinesCollection[0];

    // Split the primary line by spaces to get potential numeric string components.
    const numericStringComponents = targetDataLine.split(' ');

    // Guard clause: Verify that we have at least two components for our two numbers.
    if (numericStringComponents.length < 2) {
        outputResult = GENERAL_INPUT_ISSUE_MESSAGE;
        console.log(outputResult);
        return;
    }

    // Step 2: Parse the numeric values using the safe parsing helper.
    const operandOne = parseNumericValueSafely(numericStringComponents[0]);
    const operandTwo = parseNumericValueSafely(numericStringComponents[1]);

    // Guard clause: Ensure both parsed values are legitimate numbers.
    if (isNaN(operandOne) || isNaN(operandTwo)) {
        outputResult = GENERAL_INPUT_ISSUE_MESSAGE;
        console.log(outputResult);
        return;
    }

    // Step 3: Perform the core arithmetic operation.
    const totalCalculatedSum = operandOne + operandTwo;

    // Step 4: Determine the final output based on the sum's comparison to the threshold.
    const isSumExceedingLimit = totalCalculatedSum > SUM_UPPER_BOUND;

    if (isSumExceedingLimit) {
        outputResult = BOUND_EXCEEDED_MESSAGE;
    } else {
        // Convert the numeric sum to a string for consistent output type.
        outputResult = String(totalCalculatedSum);
    }

    // Print the final determined message to standard output.
    console.log(outputResult);
}

// Utility function to read data from the standard input stream.
const fetchStandardInputContent = () => {
    try {
        // Node.js specific method to synchronously read from stdin.
        // It's crucial that the input encoding is specified as UTF-8.
        return require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (readError) {
        // Log an error if reading from stdin fails, providing diagnostic information.
        console.error("An error occurred while attempting to read from standard input:", readError.message);
        // Return an empty string in case of read failure to prevent further processing errors.
        return "";
    }
};

// Entry point: Retrieve the input and then pass it to the main processing function.
executeSummationLogic(fetchStandardInputContent());