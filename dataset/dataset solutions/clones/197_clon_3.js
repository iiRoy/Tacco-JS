// This module processes input from standard input, categorizing specific tokens based on their content.

// Import the Node.js file system module, which is necessary for reading file content.
const fsModule = require("fs");

// Define the standard path for input, typically used in Unix-like systems.
const standardInputSourcePath = "/dev/stdin";

// Establish the regular expression pattern for splitting the input string.
// This pattern matches any whitespace character (space, tab, newline, etc.) or a comma.
const inputTokenSeparatorPattern = /\s|,/;

// Initialize various counter variables to zero. These will store the occurrences
// of specific token types found in the input data.
let countForCategoryAlpha = 0;   // Stores the count for tokens equal to 'A'.
let countForCategoryBeta = 0;    // Stores the count for tokens equal to 'B'.
let countForCategoryOmega = 0;   // Stores the count for tokens equal to 'O'.
let countForMiscellaneous = 0; // Stores the count for any token not 'A', 'B', or 'O'.

// A variable to hold the raw textual content read from the standard input.
// It's initialized as an empty string to ensure a defined state even if reading fails.
let rawInputDataBuffer = '';

try {
    // Attempt to synchronously read the entire content of the standard input file.
    // The content is interpreted and decoded using the UTF-8 character encoding.
    rawInputDataBuffer = fsModule.readFileSync(standardInputSourcePath, "utf8");
} catch (inputReadError) {
    // If an exception occurs during the file read operation (e.g., file not found,
    // permission denied, or other I/O errors), an error message is logged to the
    // console. The program then proceeds as if an empty input was provided,
    // which prevents a complete halt and allows for a graceful continuation.
    console.error(`Error encountered while reading from ${standardInputSourcePath}: ${inputReadError.message}`);
    // The rawInputDataBuffer remains an empty string, ensuring subsequent operations don't fail on undefined data.
}

// Split the raw input data buffer into an array of individual string elements (tokens).
// The splitting is performed using the predefined inputTokenSeparatorPattern.
// This operation will include empty strings in the array if there are consecutive
// delimiters or delimiters at the beginning/end of the input, consistent with the original logic.
const processedInputElements = rawInputDataBuffer.split(inputTokenSeparatorPattern);

// Initialize an index variable for iterating through the processed input elements.
// The iteration logic requires starting from the second element (index 1) and
// then skipping every other element, effectively processing elements at odd indices (1, 3, 5, ...).
let processingElementIndex = 1;

// Begin a loop to traverse the processed input elements.
// The loop continues as long as the current index is within the bounds of the array.
while (processingElementIndex < processedInputElements.length) {
    // Retrieve the element at the current `processingElementIndex`.
    // This element will be evaluated for its category.
    const currentEvaluatedToken = processedInputElements[processingElementIndex];

    // A switch statement is used to categorize the `currentEvaluatedToken`.
    // This provides a clear and structured way to handle different token types.
    switch (currentEvaluatedToken) {
        case 'A':
            // If the token is 'A', increment its specific counter.
            countForCategoryAlpha++;
            break;
        case 'B':
            // If the token is 'B', increment its specific counter.
            countForCategoryBeta++;
            break;
        case 'O':
            // If the token is 'O', increment its specific counter.
            countForCategoryOmega++;
            break;
        default:
            // If the token does not match 'A', 'B', or 'O' (e.g., it's an empty string,
            // another character, or a multi-character string), it falls into the
            // miscellaneous category, and its counter is incremented.
            countForMiscellaneous++;
            break;
    }

    // Increment the processing index by two to move to the next relevant element,
    // thereby skipping one element as per the problem's logic (j+=2).
    processingElementIndex += 2;
}

// Define the character to use as a line break in the final output string.
const outputLineBreakCharacter = '\n';

// Construct the final output string by concatenating the counts of each category,
// separated by the defined line break character.
// The order of the counts (Alpha, Beta, Miscellaneous, Omega) is preserved from the original logic.
const aggregatedResultsOutput =
    countForCategoryAlpha + outputLineBreakCharacter +
    countForCategoryBeta + outputLineBreakCharacter +
    countForMiscellaneous + outputLineBreakCharacter +
    countForCategoryOmega;

// Print the final, formatted string containing all the aggregated counts to standard output.
console.log(aggregatedResultsOutput);