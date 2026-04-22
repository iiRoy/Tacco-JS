const fileSystemOps = require("fs");

/**
 * Retrieves and processes the primary input string from the standard input stream.
 * This function handles reading the content, cleaning trailing whitespace,
 * and ensuring only the first logical line is considered for further processing.
 *
 * @returns {string} The cleaned and isolated first line of input data.
 */
function retrievePrimaryInputLine() {
    // Defines the standard input path typically used in Unix-like environments.
    const standardInputSource = "/dev/stdin";
    // Specifies the character encoding for reading the input file.
    const characterEncodingFormat = "utf8";

    // Reads the entire content from the specified standard input path.
    const rawContentBuffer = fileSystemOps.readFileSync(standardInputSource, characterEncodingFormat);

    // Removes any trailing whitespace characters (like newlines) from the buffer.
    const cleanedContent = rawContentBuffer.trimEnd();

    // Extracts the first line from the cleaned content. This handles cases
    // where input might contain multiple lines, ensuring only the first is used.
    const firstSignificantLine = cleanedContent.split('\n')[0];

    return firstSignificantLine;
}

/**
 * Computes the sum of all numerical digits present within a given string.
 * Non-digit characters encountered in the string are gracefully ignored.
 *
 * @param {string} sourceString - The string from which digits are to be extracted and summed.
 * @returns {number} The aggregated sum of all valid digits found. Returns 0 if the input
 *                   is invalid (e.g., not a string) or empty.
 */
function computeDigitAccumulation(sourceString) {
    let currentAccumulatedSum = 0; // Initialize a variable to hold the running total.

    // Perform a preliminary check to validate the input string.
    // If it's not a string or is empty, return 0 immediately.
    if (typeof sourceString !== 'string' || sourceString.length === 0) {
        // An optional warning could be logged here for debugging purposes.
        // console.warn("Warning: Input for digit sum calculation was not a valid string or was empty.");
        return 0;
    }

    // Iterate over each character in the provided string using a modern 'for...of' loop.
    for (const characterToken of sourceString) {
        // Attempt to convert the current character into an integer (base 10).
        const parsedDigitValue = parseInt(characterToken, 10);

        // Check if the parsing operation resulted in a valid number (i.e., not NaN).
        // If it's a valid digit, add it to the running sum.
        if (!isNaN(parsedDigitValue)) {
            currentAccumulatedSum += parsedDigitValue;
        }
        // Characters that are not valid digits are automatically skipped.
    }

    return currentAccumulatedSum;
}

// --- Main Program Execution Flow ---

// Step 1: Obtain the primary input line and prepare it for processing.
const processedNumericSequence = retrievePrimaryInputLine();

// Step 2: Calculate the sum of all digits found within the prepared input string.
const finalCalculatedDigitSum = computeDigitAccumulation(processedNumericSequence);

// Step 3: Determine if the calculated sum of digits is perfectly divisible by nine.
// This is a common divisibility rule check.
const divisibilityRemainder = finalCalculatedDigitSum % 9;
const isSumDivisibleByNine = (divisibilityRemainder === 0);

// Step 4: Construct the final output message based on the divisibility test result.
let outputResultString;
if (isSumDivisibleByNine) {
    outputResultString = "Yes"; // If the sum is divisible by 9.
} else {
    outputResultString = "No";  // If the sum is not divisible by 9.
}

// Step 5: Display the final determined outcome to the standard output console.
console.log(outputResultString);