"use strict";

/**
 * Analyzes an input string based on a numeric limit to find a specific character.
 * This function processes two lines of input: a target sequence and an integer boundary.
 * It searches the sequence for the first character that is not '1' within the boundary.
 * If such a character is found, it's printed. Otherwise, the character at the boundary index is printed.
 *
 * @param {string} rawInputContent - The full string read from standard input,
 *                                   expected to contain at least two newline-separated lines.
 */
function processInputData(rawInputContent) {
    // Divide the entire input string into an array of individual lines.
    // The regular expression `/\r?\n/` handles both Windows (`\r\n`) and Unix (`\n`) newlines.
    const contentSegments = rawInputContent.split(/\r?\n/);

    // Extract the primary string sequence from the first line.
    // `shift()` removes the first element from the array and returns it.
    // `trim()` removes any leading or trailing whitespace.
    const mainSequence = contentSegments.shift().trim();

    // Extract the string representation of the numeric limit from the second line.
    const limitStringValue = contentSegments.shift().trim();

    // Convert the limit string into an integer. `parseInt` with radix 10 ensures correct parsing.
    const iterationCeiling = parseInt(limitStringValue, 10);

    // A variable to store the character that will eventually be printed to the console.
    let characterToDisplay = null;

    // A flag to indicate if a specific condition (non-'1' character) was met early in the loop.
    let conditionMetEarly = false;

    // Begin iterating through the `mainSequence`.
    // The loop continues as long as `currentPosition` is less than `iterationCeiling`
    // AND `currentPosition` is within the bounds of `mainSequence`'s length.
    for (let currentPosition = 0;
         currentPosition < iterationCeiling && currentPosition < mainSequence.length;
         ++currentPosition)
    {
        // Fetch the character at the current index. Using bracket notation is an alternative to `charAt()`.
        const currentSymbol = mainSequence[currentPosition];

        // Check if the `currentSymbol` is strictly not equal to the character '1'.
        // Using `!==` ensures both value and type are compared.
        if (currentSymbol !== '1') {
            characterToDisplay = currentSymbol; // Store this character.
            conditionMetEarly = true;         // Set the flag to true.
            break;                            // Exit the loop immediately as the condition is met.
        }
    }

    // After the loop, decide what to print based on whether `conditionMetEarly` is true.
    if (conditionMetEarly) {
        // If a non-'1' character was found and the loop was exited early, print that character.
        console.log(characterToDisplay);
    } else {
        // If the loop completed without `conditionMetEarly` being set (meaning all checked characters were '1'
        // or the `iterationCeiling` was 0),
        // then print the character from `mainSequence` at the `iterationCeiling` index.
        // `charAt()` is used here to maintain behavior consistent with the original code
        // for out-of-bounds access (it returns an empty string).
        console.log(mainSequence.charAt(iterationCeiling));
    }
}

// This immediately invoked function expression (IIFE) handles the program's entry point.
// It ensures that the file system operations and main logic are encapsulated.
(function executeMainProgram() {
    // Import the Node.js file system module.
    const fileSystemHandler = require("fs");
    // Define the standard input file path.
    const standardInputFile = "/dev/stdin";
    // Specify the character encoding for reading the file.
    const characterEncoding = "utf8";

    // Read the content of the standard input file synchronously.
    const capturedInputData = fileSystemHandler.readFileSync(standardInputFile, characterEncoding);

    // Pass the captured input data to our main processing function.
    processInputData(capturedInputData);
})();