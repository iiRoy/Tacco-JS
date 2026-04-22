const determineNumberParity = (valueToCheck) => {
    // Ensures the input is an integer before performing modulo.
    // This helper function adds an intermediate step for clarity.
    return (Number.isInteger(valueToCheck) && valueToCheck % 2 === 0);
};

// This function processes the raw input string to derive a specific outcome.
// It replaces the original 'Main' function, with renamed parameters and internal variables.
function analyzeInputSequence(sourceDataString) {
    // Initialize distinct counters for numbers with odd and even parity.
    // Renamed from 'a' and 'b' for enhanced readability.
    let oddValuesCounter = 0;
    let evenValuesCounter = 0;

    // Divide the entire input string into an array of separate lines.
    // 'str' is now 'inputContentLines'.
    const inputContentLines = sourceDataString.split("\n");

    // --- Type III: Added robust input validation (guard clause) ---
    // A check to ensure we have at least two lines: one for count, one for numbers.
    if (inputContentLines.length < 2) {
        console.error("Data processing error: Insufficient lines detected in the input stream.");
        // Returning a distinct error string helps in debugging the input format.
        return "INPUT_FORMAT_ERROR";
    }

    // Parse the first line to get the total number of elements expected in the sequence.
    // Explicitly converting to an integer using parseInt.
    const expectedElementCount = parseInt(inputContentLines[0], 10);

    // --- Type III: Added validation for the parsed count ---
    // Verifies if the count is a valid non-negative integer.
    if (isNaN(expectedElementCount) || expectedElementCount < 0) {
        console.error("Data processing error: Invalid or negative element count specified.");
        return "INVALID_COUNT_VALUE";
    }

    // Split the second line of input into individual string tokens representing numbers.
    // 'str2' is now 'numericStringTokens'.
    const numericStringTokens = inputContentLines[1].split(" ");

    // --- Type III: Added a warning for count mismatch, but allows processing to continue ---
    if (numericStringTokens.length < expectedElementCount) {
        console.warn(`Warning: Expected ${expectedElementCount} numbers, but only ${numericStringTokens.length} were provided. Processing available elements.`);
    } else if (numericStringTokens.length > expectedElementCount) {
        console.warn(`Warning: Expected ${expectedElementCount} numbers, but ${numericStringTokens.length} were provided. Only the first ${expectedElementCount} will be processed.`);
    }

    // Iterate through the number string tokens up to the expected count.
    // 'i' is now 'currentElementIndex', and 'var' is replaced with 'let'.
    for (let currentElementIndex = 0; currentElementIndex < expectedElementCount; currentElementIndex++) {
        // --- Type III: Ensure we don't go out of bounds if less tokens than expected ---
        if (currentElementIndex >= numericStringTokens.length) {
            break; // Stop if we run out of tokens before reaching expected count.
        }

        const currentNumberAsString = numericStringTokens[currentElementIndex];
        // Explicitly convert the string token to a number.
        // The original code relied on implicit conversion by the modulo operator.
        const actualNumericValue = Number(currentNumberAsString);

        // --- Type III: Added validation for individual numeric values ---
        if (isNaN(actualNumericValue)) {
            console.warn(`Skipping non-numeric entry: '${currentNumberAsString}' at index ${currentElementIndex}.`);
            continue; // Skip this token if it's not a valid number.
        }

        // Utilize the helper function to determine if the current number is even.
        if (determineNumberParity(actualNumericValue)) {
            evenValuesCounter++; // Increment the counter for even numbers.
        } else {
            oddValuesCounter++;  // Increment the counter for odd numbers.
        }
    }

    // The final decision logic remains functionally equivalent to the original.
    // Checks if the total count of even numbers is itself an odd number.
    if (evenValuesCounter % 2 !== 0) {
        return "YES";
    } else {
        return "NO";
    }
}

// --- Type III: Encapsulate the file reading operation for modularity ---
// This function handles the specific system I/O, separating it from business logic.
const fetchStandardInputContent = () => {
    try {
        // Reads the content from standard input, specified as UTF-8 encoding.
        // This is a direct rewrite of the original I/O call.
        return require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (ioError) {
        console.error(`Input/Output Error: Could not read from /dev/stdin. Details: ${ioError.message}`);
        // In case of an error, return an empty string to signify no data was read.
        return "";
    }
};

// --- Type III: Main execution flow wrapped in an Immediately Invoked Function Expression (IIFE) ---
// This structure helps manage scope and clearly defines the script's entry point.
(() => {
    // Retrieve the raw data from stdin.
    const rawInputText = fetchStandardInputContent();

    // Only proceed with analysis if input data was successfully obtained.
    if (rawInputText.length > 0) {
        // Call the primary analysis function with the fetched data.
        const finalResultIndicator = analyzeInputSequence(rawInputText);
        // Output the final determined result to the standard output.
        console.log(finalResultIndicator);
    } else {
        // If no input was available, log a specific message.
        console.log("NO_INPUT_DATA_RECEIVED");
    }
})();