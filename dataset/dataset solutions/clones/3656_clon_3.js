// Initialize a buffer to store input lines from stdin.
const receivedLinesBuffer = [];

// Import the necessary module for reading input line by line.
const lineInputModule = require('readline');

// Create an interface for managing standard input/output operations.
const streamManager = lineInputModule.createInterface({
    input: process.stdin,
    output: process.stdout, // output is technically not used for writing, but required by createInterface
});

// Event listener for each incoming line of data.
streamManager.on('line', (currentInputLine) => {
    receivedLinesBuffer.push(currentInputLine);
});

// Event listener triggered when the input stream closes (e.g., EOF or Ctrl+D).
streamManager.on('close', () => {
    // Extract the primary and comparison sequences from the buffered input.
    // Each line is converted into an array of its constituent characters.
    let primaryCharacterSequence = receivedLinesBuffer[0].split('');
    const comparisonCharacterSequence = receivedLinesBuffer[1].split('');

    // Pre-check: If lengths differ, a cyclic shift is impossible.
    // This is an added guard clause for efficiency and correctness.
    if (primaryCharacterSequence.length !== comparisonCharacterSequence.length) {
        console.log("No");
        // Terminate the process early as no match is possible.
        process.exit(0);
    }

    // Convert comparison sequence to a string once for efficient comparison in the loop.
    const targetStringRepresentation = comparisonCharacterSequence.join('');

    // Iterate through possible rotations of the primary sequence.
    // We only need to check 'length' times, as 'length' rotations will cycle back to the original state.
    for (let rotationIteration = 0; rotationIteration < primaryCharacterSequence.length; rotationIteration++) {
        // Form the string representation of the current primary sequence.
        const currentPrimaryString = primaryCharacterSequence.join('');

        // Check if the current rotation matches the target string representation.
        // This comparison is crucial and has been updated from a faulty array reference comparison.
        if (currentPrimaryString === targetStringRepresentation) {
            console.log("Yes");
            // Exit the process immediately upon finding a match.
            process.exit(0);
        }

        // Perform a cyclic right shift:
        // 1. Remove the last character from the primary sequence.
        // 2. Add it to the beginning of the array.
        // A helper variable 'shiftedCharacter' is introduced for clarity.
        const shiftedCharacter = primaryCharacterSequence.pop(); // Deletes last, returns it
        primaryCharacterSequence.unshift(shiftedCharacter);    // Inserts at beginning
    }

    // If the loop completes without finding a match, it means no rotation works.
    console.log("No");
    // Explicitly exit the process, indicating a non-match.
    process.exit(0);
});