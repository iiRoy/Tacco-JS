// This script processes input from standard input to count remaining characters after a specific reduction rule.
// It simulates a stack-like operation for 'S' and 'T' characters.

// The following lines are commented out in the original, so they remain commented here.
// process.stdin.resume();
// process.stdin.setEncoding('utf8');
// process.stdin.on('data', function(inputSegment) {
    // The primary function is invoked with data read directly from /dev/stdin.
    processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
// });

/**
 * Processes a given string of characters according to a specific rule.
 * 'S' characters are pushed onto a stack.
 * 'T' characters pop an 'S' if available, otherwise they are pushed.
 * The final length of the stack is printed.
 * @param {string} inputData The entire input string to be processed.
 */
function processInput(inputData) {
    // Initialize an empty array to act as our character stack.
    let resultStack = [];

    // Convert the input string into an array of individual characters.
    const charSequence = inputData.split("");

    // Iterate through each character in the sequence using its index.
    for (const idx in charSequence) {
        // Determine action based on the current character.
        switch (charSequence[idx]) {
            case 'S': // If the character is 'S'
                resultStack.push('S'); // Add 'S' to our stack.
                break;

            case 'T': // If the character is 'T'
                // Check if the stack is not empty and the last element is 'S'.
                if (resultStack.length > 0 && resultStack[resultStack.length - 1] === 'S') {
                    resultStack.pop(); // Remove the 'S' (matching pair).
                } else {
                    resultStack.push('T'); // Otherwise, add 'T' to the stack.
                }
                break;
            // No default case needed as only 'S' and 'T' are relevant for the algorithm.
        }
    }

    // Output the final count of remaining items in the stack.
    console.log(resultStack.length);
}
