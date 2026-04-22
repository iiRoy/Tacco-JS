function ProcessNumericSeries(rawInputString) {
    // This function orchestrates the primary logic:
    // It takes a string input, parses it to a number,
    // and then iteratively processes this number, accumulating
    // the count of trailing zeros at each step of a decrementing series.

    // Attempt to parse the raw input string into an integer value.
    // Specifying radix 10 ensures the parsing is always decimal.
    let parsedNumericVal = Number.parseInt(rawInputString, 10);

    // Initialize a variable to accumulate the total count of trailing zeros
    // across all iterations of the processing loop.
    let cumulativeTrailingZeroes = 0;

    // --- Start of Type III additions/updates ---

    // Guard clause: Validate the parsed input.
    // If it's not a valid number or is non-positive,
    // the main loop (which requires a positive starting number) will not execute,
    // thus preventing unexpected behavior or infinite loops.
    if (Number.isNaN(parsedNumericVal) || parsedNumericVal <= 0) {
        // Optionally, one could throw an error or log a warning here.
        // For this clone, we'll let the loop condition handle it,
        // which will effectively result in `cumulativeTrailingZeroes` remaining 0.
        // console.warn("Input must be a positive integer. Processing skipped.");
    }

    // Define the fixed decrement value for each step of the series.
    const seriesDecrementStep = 2;

    // --- End of Type III additions/updates ---

    // Begin the main processing loop.
    // The loop continues as long as the current numeric value remains positive.
    while (parsedNumericVal > 0) {
        // In each iteration, call the helper function to determine the
        // number of trailing zeros for the current value, and add it
        // to our running total.
        cumulativeTrailingZeroes += countEndingZeros(parsedNumericVal);

        // Decrement the numeric value by the predefined step for the next iteration.
        parsedNumericVal -= seriesDecrementStep;
    }

    // After the loop completes, output the final accumulated count
    // of all trailing zeros encountered throughout the series.
    console.log(cumulativeTrailingZeroes);
}

function countEndingZeros(currentNumericValue) {
    // This helper function identifies and counts the number of '0' digits
    // that appear consecutively at the very end of a number's string representation.

    // --- Start of Type III additions/updates ---

    // Early exit/guard clause: If the input value is exactly zero,
    // its string representation is "0", which has one trailing zero.
    // This is a specific case handled explicitly for clarity.
    if (currentNumericValue === 0) {
        return 1;
    }

    // Define the character we are looking for, '0'.
    // Using a constant makes the code more readable and maintainable.
    const targetDigitChar = '0';

    // --- End of Type III additions/updates ---

    // Convert the numeric value into its string form to enable digit-by-digit inspection.
    const numericStringRepresentation = String(currentNumericValue);

    // Initialize the counter for trailing zeros.
    let trailingZeroCounter = 0;

    // Iterate backwards from the last character (rightmost digit) of the string.
    // The loop continues as long as we haven't gone past the beginning of the string
    // and the current character is indeed the target zero digit.
    for (let charIndex = numericStringRepresentation.length - 1; charIndex >= 0; charIndex--) {
        // Check if the character at the current position is a '0'.
        if (numericStringRepresentation[charIndex] === targetDigitChar) {
            // If it is '0', increment our counter.
            trailingZeroCounter++;
        } else {
            // If a non-zero digit is encountered, it means the sequence of
            // trailing zeros has ended. We can stop checking further.
            break;
        }
    }

    // Return the total count of trailing zero digits found.
    return trailingZeroCounter;
}

// --- Start of Type III additions/updates ---

// This block serves as the application's entry point.
// It handles reading input from standard input and passing it to the main processing function.
try {
    // Utilize the 'node:fs' module for file system operations.
    // Read the entire content of '/dev/stdin' as a UTF-8 encoded string.
    const fileContentFromStdin = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" });

    // Pass the cleaned content (trimmed of leading/trailing whitespace, like newlines)
    // to the primary processing function.
    ProcessNumericSeries(fileContentFromStdin.trim());
} catch (ioError) {
    // If any error occurs during file reading (e.g., file not found, permissions),
    // log the error message to standard error.
    console.error("Error reading input from /dev/stdin:", ioError.message);
    // In a production environment, one might choose to exit the process here.
    // process.exit(1);
}

// --- End of Type III additions/updates ---