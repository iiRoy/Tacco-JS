/**
 * Processes an input string by iteratively removing specific character pairs.
 * This function identifies and eliminates "10" or "01" sequences,
 * counting the total number of such pairs removed.
 *
 * @param {string} initialSequence The raw string input to be processed.
 * @returns {number} The total count of characters removed, which is twice the number of pairs.
 */
function analyzeAndReduceSequence(initialSequence) {
    // Transform the input string into a mutable array of individual characters.
    let characterBuffer = initialSequence.split('');

    // Counter for the total number of matched pairs removed during the process.
    let matchedPairTally = 0;

    // Flag to control the outer loop. It remains true as long as
    // the inner scan pass results in at least one pair removal,
    // ensuring that all possible pairs are eventually found and removed.
    let changesOccurredInLastPass = true;

    // Outer processing cycle: Continues as long as modifications are being made.
    while (changesOccurredInLastPass) {
        // Reset the flag for the current pass; assume no changes until one is found.
        changesOccurredInLastPass = false;
        // Index for iterating through the character buffer in the inner loop.
        let currentPosition = 0;

        // Inner scanning cycle: Iterates through the character buffer.
        // The loop condition `characterBuffer.length - 1` prevents out-of-bounds access
        // when checking `characterBuffer[currentPosition + 1]`.
        while (currentPosition < characterBuffer.length - 1) {
            const charAtCurrent = characterBuffer[currentPosition];
            const charAtNext = characterBuffer[currentPosition + 1];

            // Check if the current character and the next character form a "10" or "01" pair.
            if ((charAtCurrent === '1' && charAtNext === '0') ||
                (charAtCurrent === '0' && charAtNext === '1')) {

                // A valid pair has been identified. Increment the pair counter.
                matchedPairTally++;
                // Set the flag to true, indicating that a change was made in this pass.
                changesOccurredInLastPass = true;

                // Remove the matched pair (two characters) from the buffer.
                // The `splice` method modifies the array in place, shifting subsequent elements.
                // By not incrementing `currentPosition` here, the loop effectively re-evaluates
                // the element that has shifted into the `currentPosition` index in the next iteration.
                characterBuffer.splice(currentPosition, 2);
            } else {
                // If no pair was found at the current position, move to the next character.
                currentPosition++;
            }
        }
    }

    // The final result is twice the number of pairs found,
    // representing the total count of individual characters removed.
    return matchedPairTally * 2;
}

// Entry point for execution: Reads input from standard input,
// processes it using the defined function, and prints the final result.
const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const finalComputedValue = analyzeAndReduceSequence(rawInputContent);
console.log(finalComputedValue);