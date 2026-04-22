'use strict';

// Helper constants for character codes and alphabet size
const CHAR_CODE_A = 'a'.charCodeAt(0); // ASCII value for 'a' (97)
const CHAR_CODE_Z = 'z'.charCodeAt(0); // ASCII value for 'z' (122)
const ALPHABET_SPAN = 26;              // Number of letters in the English alphabet

/**
 * Transforms a given string based on a budget of 'transformation points'.
 * The primary goal is to convert characters to 'a' using a specific wrap-around cost.
 * If points remain, the last character is modified.
 *
 * @param {string} rawInputData - The raw input string containing the target text and points on separate lines.
 */
function processTextTransform(rawInputData) {
    // Split the input into individual lines
    const parsedLines = rawInputData.split("\n");

    // Validate input structure: ensure there are at least two lines for string and points.
    if (parsedLines.length < 2) {
        console.error("Error: Insufficient input lines. Expected at least two lines.");
        return; // Exit if input is malformed
    }

    // Extract the initial string and transformation budget from the parsed lines.
    // The first line is the text to be transformed, the second line is the integer budget.
    let mutableCharacterSequence = parsedLines[0];
    let transformationBudget = parseInt(parsedLines[1], 10); // Explicit radix for parseInt for robustness.

    // Validate the transformation budget: it must be a non-negative number.
    if (isNaN(transformationBudget) || transformationBudget < 0) {
        console.error("Error: Transformation budget is invalid or negative.");
        return;
    }
    
    // Convert the string to a character array for easier in-place modification.
    // This avoids repeated string concatenation, which can be inefficient.
    let charArray = mutableCharacterSequence.split('');

    // Initialize an index to track the current position within the character array.
    let currentPositionIndex = 0;

    // Main transformation loop: continues as long as there's budget remaining
    // and we haven't processed beyond the end of the character array.
    while (transformationBudget > 0 && currentPositionIndex < charArray.length) {
        // Retrieve the ASCII value of the character at the current position.
        const currentCharCode = charArray[currentPositionIndex].charCodeAt(0);

        // Scenario 1: The current character is already 'a'.
        // In this case, no points are spent, and no transformation is needed.
        if (currentCharCode === CHAR_CODE_A) {
            currentPositionIndex++; // Simply advance to the next character.
        } else {
            // Scenario 2: The current character is not 'a'.
            // Calculate the points required to transform this character to 'a' by wrapping around.
            // For example, 'z' to 'a' costs 1 point, 'y' to 'a' costs 2 points, 'b' to 'a' costs 25 points.
            const costToNormalizeChar = ALPHABET_SPAN - (currentCharCode - CHAR_CODE_A);

            // Check if the available budget is sufficient to normalize this character to 'a'.
            if (costToNormalizeChar <= transformationBudget) {
                // If sufficient, apply the transformation:
                transformationBudget -= costToNormalizeChar; // Deduct the cost from the budget.
                charArray[currentPositionIndex] = 'a';     // Change the character to 'a' in the array.
                currentPositionIndex++;                     // Move to the next character.
            } else {
                // If not enough budget to normalize the current character to 'a'.
                // Check if this is the last character in the sequence.
                if (currentPositionIndex === charArray.length - 1) {
                    // This is the final character. All remaining budget (modulo alphabet size)
                    // will be applied to this character to shift it forward.
                    const effectiveShift = transformationBudget % ALPHABET_SPAN;

                    // Calculate the new character code after applying the shift.
                    let newCharCode = currentCharCode + effectiveShift;

                    // Handle wrap-around if the new character's code exceeds 'z'.
                    // If it goes past 'z', it wraps back to 'a'.
                    if (newCharCode > CHAR_CODE_Z) {
                        newCharCode = ((newCharCode - CHAR_CODE_A) % ALPHABET_SPAN) + CHAR_CODE_A;
                    }
                    
                    // Update the character in the array with the newly calculated character.
                    charArray[currentPositionIndex] = String.fromCharCode(newCharCode);
                    
                    // All transformation budget is considered spent at this point for the last character,
                    // regardless of the `effectiveShift` value. This terminates the loop.
                    transformationBudget = 0; 
                } else {
                    // Not the last character, and insufficient budget for normalization.
                    // Skip this character and move on without modifying it.
                    currentPositionIndex++;
                }
            }
        }
    }

    // After the loop, reconstruct the string from the modified character array.
    mutableCharacterSequence = charArray.join('');

    // Output the final transformed string to the console.
    console.log(mutableCharacterSequence);
}

// Entry point for execution: reads input from standard input and passes it to the transformation function.
processTextTransform(require("fs").readFileSync("/dev/stdin", "utf8"));