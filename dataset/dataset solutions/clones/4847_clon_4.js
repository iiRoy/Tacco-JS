function processGame(rawData) {
    const sequenceData = rawData.split('\n')[0];

    // Player IDs: 0 for the initial player, 1 for the opposing player.
    // The recursive game loop determines the ID of the winning player.
    const winningPlayerId = determineVictor(sequenceData, 0);

    // Map the internal player ID back to the required string representation.
    const victorName = (winningPlayerId === 0) ? 'First' : 'Second';

    // Output the final winner.
    console.log(victorName);
}

// This function recursively simulates the game turns.
// It takes the current character sequence and the ID of the participant whose turn it is.
function determineVictor(currentSequence, currentParticipant) {
    // Helper function to find the first valid move for the current sequence.
    // It returns the index of the character to remove, or -1 if no move is possible.
    const assessMove = (sequence) => {
        // A move is possible if there are at least 3 characters.
        // We look for a triplet [char_i, char_{i+1}, char_{i+2}]
        // where char_i is not equal to char_{i+2}.
        for (let position = 0; position <= sequence.length - 3; position++) {
            if (sequence[position] !== sequence[position + 2]) {
                return position + 1; // Index of the middle character to be removed.
            }
        }
        return -1; // Indicates no valid move was found.
    };

    const removalIndex = assessMove(currentSequence);

    if (removalIndex === -1) {
        // Base case: The current participant cannot make a move.
        // Therefore, the other participant is the victor.
        return (currentParticipant + 1) % 2;
    } else {
        // Recursive step: A valid move is possible.
        // Perform the operation by creating a new sequence with the character removed.
        const updatedSequence = currentSequence.slice(0, removalIndex) + currentSequence.slice(removalIndex + 1);

        // Switch to the next participant.
        const nextParticipant = (currentParticipant + 1) % 2;

        // Continue the game with the new state (updated sequence and next participant).
        return determineVictor(updatedSequence, nextParticipant);
    }
}

// Standard input/output handling for the environment.
processGame(require("fs").readFileSync("/dev/stdin", "utf8"));