const retrieveSystemInput = () => {
    // Accessing the Node.js 'fs' (file system) module to read data.
    const fileSystemHandler = require("fs");

    // Reading the entire content of standard input synchronously.
    // The encoding is specified as 'utf8' to correctly interpret character data.
    // The .trim() method is applied to remove any leading or trailing whitespace,
    // including newline characters, ensuring only the significant data is processed.
    const acquiredTextContent = fileSystemHandler.readFileSync("/dev/stdin", "utf8").trim();

    return acquiredTextContent;
};

/**
 * Executes the primary logic to compute the aggregate sum of numerical digits
 * present within a given textual string. This process involves several steps:
 * 1. Validating the input string to handle empty cases gracefully.
 * 2. Decomposing the input string into an array of individual characters.
 * 3. Converting each character into its numeric equivalent. Non-numeric characters
 *    will result in NaN (Not-a-Number), which will propagate through the sum,
 *    mimicking the behavior of the original implementation.
 * 4. Summing all the numeric values (including NaN, if present) to derive the final total.
 * 5. Printing the computed sum to the standard output.
 *
 * @param {string} sourceSequence The input string that may contain digits.
 * @returns {number} The calculated sum of digits. Returns 0 for empty input,
 *                   or NaN if any non-numeric character caused NaN propagation.
 */
function ProcessAndSumDigitStream(sourceSequence) {
    // Declare a variable to hold the final accumulated result.
    // Using 'let' for block-scope and mutability.
    let finalAccumulatedResult = 0;

    // --- Start of Type III structural modifications and additions ---

    // Guard clause: Early exit for empty or non-existent input strings.
    // If the input is empty after trimming, there are no digits to process.
    if (!sourceSequence || sourceSequence.length === 0) {
        // Optionally log a warning for clarity in debugging or operation.
        console.warn("Input stream appears to be empty. Defaulting sum to zero.");
        console.log(0); // Output 0 as per the original's behavior for empty input.
        return 0;
    }

    // Step 1: Transform the input string into an iterable collection of its characters.
    // The spread operator `...` provides a concise way to create an array from a string.
    const individualCharacters = [...sourceSequence];

    // Step 2: Convert each character in the array to its numerical representation.
    // The `Number()` constructor is used here, which is equivalent to `map(Number)`
    // in the original code. It handles digit strings ("1" -> 1), empty strings ("" -> 0),
    // and non-numeric strings ("a" -> NaN).
    const convertedNumericElements = individualCharacters.map(charSegment => {
        return Number(charSegment);
    });

    // --- End of Type III structural modifications and additions ---

    // Step 3: Perform the summation using the `reduce` method.
    // This functional approach replaces the explicit `forEach` loop from the original.
    // The `reduce` method iterates over the `convertedNumericElements` array,
    // applying the provided callback function to accumulate a single result.
    // The initial value for the accumulator (`currentTotal`) is set to 0.
    // If any element in `convertedNumericElements` is `NaN`, the sum will become `NaN`
    // and remain `NaN`, replicating the original's error propagation.
    finalAccumulatedResult = convertedNumericElements.reduce((currentTotal, numericValue) => {
        return currentTotal + numericValue;
    }, 0); // Starting the sum from zero.

    // Step 4: Output the final computed sum.
    // This is the core purpose of the script.
    console.log(finalAccumulatedResult);

    // Although the original only logged, returning the result makes the function more versatile.
    return finalAccumulatedResult;
}

// Main execution block:
// First, acquire the raw data from the standard input.
const rawInputData = retrieveSystemInput();

// Then, pass the acquired data to the processing function.
// The function itself handles the final output.
ProcessAndSumDigitStream(rawInputData);