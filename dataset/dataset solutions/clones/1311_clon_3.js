(function (sourceContent) {
    // This self-executing function processes a block of text,
    // calculating the sum of digits for each valid number line
    // until a termination signal (zero) is encountered.

    // --- Input Validation and Setup ---
    if (!sourceContent || typeof sourceContent !== 'string' || sourceContent.trim().length === 0) {
        // If the input content is invalid, empty, or not a string,
        // we log an error and exit gracefully without further processing.
        console.error("Input stream content is invalid or empty. Terminating execution.");
        return;
    }

    // Split the entire input string into an array of individual lines.
    // Using a regular expression for splitting ensures compatibility with
    // different newline characters (CRLF, LF) across operating systems.
    const inputLines = sourceContent.split(/\r?\n/);

    // A boolean flag to control the main processing loop.
    // It will be set to false when the termination condition is met.
    let continueProcessingFlag = true;

    // An index to keep track of the current line being processed.
    let currentLinePointer = 0;

    // --- Main Processing Loop ---
    // The loop continues as long as there are lines to process
    // and the termination flag has not been set.
    while (currentLinePointer < inputLines.length && continueProcessingFlag) {

        // Retrieve the current line and remove any leading/trailing whitespace.
        let rawLineSegment = inputLines[currentLinePointer].trim();

        // Increment the line pointer for the next iteration.
        currentLinePointer++;

        // Skip processing if the line is empty after trimming.
        // This handles blank lines in the input without error.
        if (rawLineSegment.length === 0) {
            continue;
        }

        // Attempt to convert the cleaned line segment into an integer.
        // `parseInt` is used with a radix of 10 for explicit base conversion.
        let numericalValue = parseInt(rawLineSegment, 10);

        // --- Data Validation ---
        // Check if the conversion resulted in a valid number.
        // If `isNaN` returns true, the line was not a valid number.
        if (isNaN(numericalValue)) {
            console.warn(`Skipping line '${rawLineSegment}' as it is not a valid number.`);
            continue; // Move to the next line.
        }

        // Define the specific value that signals the end of processing.
        const endOfInputSentinel = 0;

        // --- Termination Condition Check ---
        // If the numerical value is the sentinel, set the flag to stop the loop.
        if (numericalValue === endOfInputSentinel) {
            continueProcessingFlag = false;
            // No further action for this line, the loop will terminate.
        } else {
            // --- Digit Sum Calculation ---
            // Convert the valid number back to its string representation.
            const numberAsText = String(numericalValue);

            // Create an array of individual digit characters from the number string.
            // `Array.from` is used as an alternative to `split('')`.
            const characterDigits = Array.from(numberAsText);

            // Transform the array of character digits into an array of actual numbers.
            // `map` is used to apply `parseInt` to each character.
            const numericDigitsArray = characterDigits.map(char => parseInt(char, 10));

            // Calculate the sum of all numbers in the `numericDigitsArray` using `reduce`.
            // An explicit initial value of 0 is provided for the accumulator.
            const totalDigitSum = numericDigitsArray.reduce(function (accumulatorValue, currentDigitValue) {
                return accumulatorValue + currentDigitValue;
            }, 0);

            // Output the computed sum of digits to the console.
            console.log(totalDigitSum);
        }
    }

    // Optional: A final message indicating completion.
    // console.info("Processing of input stream finished.");

// --- Input Source ---
// The input for this script is read synchronously from standard input ('/dev/stdin')
// using Node.js's file system module, and decoded as UTF-8.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));