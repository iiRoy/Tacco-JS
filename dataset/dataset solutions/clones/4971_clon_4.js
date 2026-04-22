'use strict';

function determineVictor(currentParticipantIndex, remainingMoves) {
    // The current participant plays their first available move.
    const nextParticipantCharacter = remainingMoves[currentParticipantIndex][0];
    // Convert 'a', 'b', 'c' to 0, 1, 2 for array indexing.
    const nextParticipantIndex = nextParticipantCharacter.charCodeAt(0) - 'a'.charCodeAt(0);

    // Create a new set of move sequences to reflect the current participant's move.
    // This ensures immutability for the recursive calls.
    const modifiedMoves = remainingMoves.map((sequence, index) => {
        if (index === currentParticipantIndex) {
            // The current participant's sequence loses its first element.
            return sequence.slice(1);
        }
        // Other participants' sequences remain unchanged.
        return sequence;
    });

    // After playing their move, check if the current participant's sequence is now empty.
    if (modifiedMoves[currentParticipantIndex].length === 0) {
        // If it is, this participant successfully played their last move and is the victor.
        // Convert the index (0, 1, 2) back to 'A', 'B', 'C'.
        return String.fromCharCode(65 + currentParticipantIndex);
    }

    // If the current participant still has moves, the game continues with the next participant.
    return determineVictor(nextParticipantIndex, modifiedMoves);
}

function processGameInput(rawText) {
    const textLines = rawText.split('\n');

    // Initialize player move sequences from the first three lines of input.
    // Each sequence is an array of characters.
    const initialPlayerSequences = [
        Array.from(textLines[0]),
        Array.from(textLines[1]),
        Array.from(textLines[2])
    ];

    // Start the game with the first participant (index 0, corresponding to 'a').
    return determineVictor(0, initialPlayerSequences);
}

// Read input from standard input and print the result.
console.log(processGameInput(require("node:fs").readFileSync(0, "utf8")));