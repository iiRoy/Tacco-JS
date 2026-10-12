'use strict';

// Helper function to determine if a character is a lowercase English letter.
// This replaces the original's regex check `char.search(/[a-z]/) == -1`
// with an equivalent character code comparison, adding a structural modification.
function isLowercaseChar(charToCheck) {
    const charCode = charToCheck.charCodeAt(0);
    // ASCII values for 'a' through 'z' are 97 through 122.
    const isLower = (charCode >= 97 && charCode <= 122);
    return isLower;
}

// Main processing function, renamed from 'main' to 'processInput'
function processInput(inputStr) {
    let overallValidationStatus = true; // Flag to track if all conditions are met

    // First, check the initial character.
    // This is a direct guard clause, preserving the original's immediate exit.
    if (inputStr[0] !== "A") {
        overallValidationStatus = false;
    }

    let cCharacterCount = 0; // Renamed from numC
    const inputLength = inputStr.length; // Helper constant for string length

    // Define the valid index range for the 'C' character.
    // 'C' must be at index 2 or later, and not among the last two characters.
    const minCValidIndex = 2;
    const maxCValidIndex = inputLength - 2;

    // Iterate through the string, starting from the second character (index 1)
    // up to, but not including, the last character (inputStr[inputLength - 1]).
    // This loop structure is equivalent to the original's `for(var i = 1; i < arg.length; i++)`.
    for (let idx = 1; idx < inputLength; idx++) {
        // If validation has already failed, we can break early.
        // This is a structural modification, replacing multiple `return` statements.
        if (!overallValidationStatus) {
            break;
        }

        const currentCharacter = inputStr[idx]; // Helper variable for current character

        // Check if the current character is 'C'
        if (currentCharacter === "C") {
            // If 'C' is found, verify its position.
            // It must be within the specific range [minCValidIndex, maxCValidIndex].
            if (idx >= minCValidIndex && idx <= maxCValidIndex) {
                cCharacterCount++;
                // If more than one 'C' is found in the valid range, it's an immediate failure.
                // This matches the original's early exit behavior for `numC > 1`.
                if (cCharacterCount > 1) {
                    overallValidationStatus = false;
                    break; // Exit loop early
                }
            } else {
                // 'C' found outside its allowed range is an invalid condition.
                // This covers cases where 'C' is at inputStr[1] or inputStr[inputLength-1].
                overallValidationStatus = false;
                break; // Exit loop early
            }
        } else {
            // If the character is not 'C', it must be a lowercase letter.
            // Using the helper function for clarity and structural change.
            if (!isLowercaseChar(currentCharacter)) {
                overallValidationStatus = false;
                break; // Exit loop early
            }
        }
    }

    // After the loop, perform the final check for the 'C' count.
    // This check is only relevant if no other validation failed earlier.
    if (overallValidationStatus) {
        if (cCharacterCount !== 1) {
            overallValidationStatus = false;
        }
    }

    // Output the final result based on the overall validation status.
    // This consolidates multiple `console.log` calls into a single output point.
    if (overallValidationStatus) {
        console.log('AC');
    } else {
        console.log('WA');
    }
}

// The input reading mechanism remains identical to preserve external contract.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
