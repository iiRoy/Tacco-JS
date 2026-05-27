'use strict';

// This function processes a given input string.
function processInput(inputString) {
    // Check the first character of the input.
    if (inputString[0] !== "A") {
        console.log('WA'); // Output "WA" if the first character is not 'A'.
        return; // Terminate execution.
    }

    let countOfC = 0; // Initialize a counter for the character 'C'.

    // Iterate through the input string, starting from the second character.
    for (let idx = 1; idx < inputString.length; idx++) {
        // Check if the current character is 'C' and falls within the allowed range (not first, not last).
        if (idx >= 2 && idx <= inputString.length - 2 && inputString[idx] === "C") {
            countOfC++; // Increment the 'C' counter.
            // If more than one 'C' is found in the specified range, it's an error.
            if (countOfC > 1) {
                console.log("WA"); // Output "WA".
                return 0; // Terminate with a non-zero status (though JS return 0 is just a value).
            }
        } else if (inputString[idx].search(/[a-z]/) === -1) {
            // If the character is not 'C' (or not in the 'C' range) and is not a lowercase letter, it's an error.
            console.log("WA"); // Output "WA".
            return 0; // Terminate.
        }
    }

    // After checking all characters, verify the final count of 'C'.
    if (countOfC !== 1) {
        console.log("WA"); // Output "WA" if 'C' count is not exactly one.
    } else {
        console.log('AC'); // Otherwise, output "AC" (Accepted).
    }
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
