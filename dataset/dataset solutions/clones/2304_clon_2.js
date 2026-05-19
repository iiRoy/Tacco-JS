// This function generates permutations, though it's not used in Main.
function generateSequences(maxValue, sequenceLength) {
    let currentSequences = [[]]; // Initialize with an empty sequence
    let nextSequences; // Will hold sequences for the next iteration

    // Loop to build sequences of desired length
    for (let idx = 0; idx < sequenceLength; idx++) {
        nextSequences = []; // Reset for the current iteration
        currentSequences.forEach(currentSeq => {
            // Iterate through possible values
            for (let val = 1; val <= maxValue; val++) {
                // Check if the value is already in the current sequence
                if (!currentSeq.includes(val)) {
                    // If not, add it and push the new sequence
                    nextSequences.push(currentSeq.concat([val]));
                }
            }
        });
        // Update currentSequences for the next iteration
        currentSequences = nextSequences.concat([]); // Deep copy
    }
    return currentSequences; // Return the generated sequences
}

// Main processing function for the game logic
function ProcessInput(rawData) {
    // Split the raw input string into an array of lines
    rawData = rawData.split("\n");

    // Remove the last element if it's an empty string (common with stdin)
    if (rawData[rawData.length - 1] === '') {
        rawData.pop();
    }

    // Parse game parameters from the first line
    const totalRounds = parseInt(rawData[0].split(' ')[0]); // N
    const blockInterval = parseInt(rawData[0].split(' ')[1]); // K

    // Parse scores for winning moves from the second line
    const rockScore = parseInt(rawData[1].split(' ')[0]); // R (score for winning with rock)
    const scissorsScore = parseInt(rawData[1].split(' ')[1]); // S (score for winning with scissors)
    const paperScore = parseInt(rawData[1].split(' ')[2]); // P (score for winning with paper)

    // Get the opponent's moves sequence from the third line
    const opponentMoves = rawData[2]; // T

    let totalScore = 0; // Initialize the player's total score

    // Create an array to track skipped moves due to consecutive identical moves
    let skippedMoves = new Array(totalRounds).fill(false); // Initialize all to false

    // Iterate through each round of the game
    for (let roundIndex = 0; roundIndex < opponentMoves.length; roundIndex++) {
        // Check for the "block" condition:
        // If current round is past the interval K,
        // and the opponent's move is the same as K rounds ago,
        // and the move K rounds ago was NOT skipped.
        if (roundIndex >= blockInterval && opponentMoves[roundIndex] === opponentMoves[roundIndex - blockInterval] && !skippedMoves[roundIndex - blockInterval]) {
            skippedMoves[roundIndex] = true; // Mark the current move as skipped
            continue; // Skip scoring for this round
        }

        // Determine score based on the opponent's current move
        switch (opponentMoves[roundIndex]) {
            case 'r': // Opponent plays rock, player wins with paper
                totalScore += paperScore;
                break;
            case 's': // Opponent plays scissors, player wins with rock
                totalScore += rockScore;
                break;
            case 'p': // Opponent plays paper, player wins with scissors
                totalScore += scissorsScore;
                break;
        }
    }

    // Output the final calculated score
    console.log(totalScore);
}

// The following line should not be modified (reads from stdin and calls the main function)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
