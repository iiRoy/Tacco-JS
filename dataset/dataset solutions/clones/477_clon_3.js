// This program simulates a multi-round elimination game based on FizzBuzz rules.
// It reads game parameters and player submissions from standard input,
// identifying and listing the players who successfully complete all rounds.

// Import the necessary Node.js module for file system operations, specifically reading input.
const fileSystem = require('fs');

/**
 * Calculates the expected FizzBuzz string for a given numerical turn.
 * This function encapsulates the core FizzBuzz logic.
 * @param {number} currentNumericalTurn The turn number (1-indexed) for which to determine the output.
 * @returns {string} The correct FizzBuzz or number string.
 */
function calculateExpectedFizzBuzz(currentNumericalTurn) {
    const FIZZ_NUMBER = 3; // Standard divisor for "Fizz"
    const BUZZ_NUMBER = 5; // Standard divisor for "Buzz"

    const isDivisibleByFizz = (currentNumericalTurn % FIZZ_NUMBER === 0);
    const isDivisibleByBuzz = (currentNumericalTurn % BUZZ_NUMBER === 0);

    // Apply FizzBuzz rules:
    if (isDivisibleByFizz && isDivisibleByBuzz) {
        return "FizzBuzz";
    } else if (isDivisibleByFizz) {
        return "Fizz";
    } else if (isDivisibleByBuzz) {
        return "Buzz";
    } else {
        // If not divisible by either, return the number as a string.
        return String(currentNumericalTurn);
    }
}

/**
 * Iterates through the player status array to find the next active player,
 * wrapping around the array if necessary.
 * @param {number} searchStartIdx The index from which to begin the search.
 * @param {boolean[]} playerEligibilityStatus An array where `true` means active, `false` means eliminated.
 * @returns {number} The 0-based index of the next active player.
 */
function locateNextActiveParticipant(searchStartIdx, playerEligibilityStatus) {
    const totalParticipantCount = playerEligibilityStatus.length;
    let currentScanIndex = searchStartIdx;

    // Loop until an active player is found. This assumes at least one player is active initially.
    while (!playerEligibilityStatus[currentScanIndex]) {
        currentScanIndex = (currentScanIndex + 1) % totalParticipantCount; // Move to next index, wrap if needed
    }
    return currentScanIndex;
}

// --- Main Program Execution Flow ---

// Read all incoming data from standard input, convert it to a string,
// remove any leading/trailing whitespace, and then split it into an array of lines.
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
let processedInputLines = rawInputContent.trim().split('\n');

// The primary game loop continues until a specific termination sequence is encountered.
while (true) {
    // Extract the first line which contains the game's dimensions (number of players and rounds).
    const currentScenarioLine = processedInputLines.shift();

    // Split this line to get individual numerical tokens.
    const scenarioTokens = currentScenarioLine.split(' ');

    // Check for the game termination condition: "0 0".
    // Using Number() for explicit type conversion and strict equality for robustness.
    if (Number(scenarioTokens[0]) === 0 && Number(scenarioTokens[1]) === 0) {
        break; // Exit the main simulation loop.
    }

    // Parse the number of players and the total number of rounds for the current scenario.
    const numPlayersInGame = Number(scenarioTokens[0]);
    const totalGameRounds = Number(scenarioTokens[1]);

    // Initialize the status for all players: initially, everyone is active (`true`).
    // Using `Array.from` for a clear and modern way to create and fill an array.
    const playerActiveFlags = Array.from({ length: numPlayersInGame }, () => true);

    // Variables to manage the game's state:
    let currentTurnCounter = 0; // Tracks the actual turn number for FizzBuzz (1-indexed).
    let activePlayerPointer = 0; // Points to the current player (0-indexed) whose turn it is.

    // Iterate through each round of the game.
    // A `for` loop provides clearer iteration count management than `while(n--)`.
    for (let roundIteration = 0; roundIteration < totalGameRounds; ++roundIteration) {
        // Increment the turn counter for FizzBuzz calculation (e.g., 1, 2, 3...).
        currentTurnCounter++;

        // Determine what the player *should* say this turn.
        const correctFizzBuzzResponse = calculateExpectedFizzBuzz(currentTurnCounter);

        // Retrieve the player's actual submission from the input data.
        const actualPlayerSubmission = processedInputLines.shift();

        // Find the actual active player who is supposed to play this turn.
        // This skips any players who might have been eliminated in previous rounds.
        activePlayerPointer = locateNextActiveParticipant(activePlayerPointer, playerActiveFlags);

        // Compare the player's submission with the correct answer.
        if (actualPlayerSubmission !== correctFizzBuzzResponse) {
            // If the submission is incorrect, the player is eliminated.
            playerActiveFlags[activePlayerPointer] = false;
        }

        // After a player has made their move, we need to prepare the pointer for the next round.
        // This logic ensures the pointer advances correctly, skipping inactive players,
        // and importantly, it does NOT advance the pointer if this is the very last round.
        if (roundIteration < totalGameRounds - 1) { // If it's not the final round
            // First, move the pointer to the next physical player position.
            activePlayerPointer = (activePlayerPointer + 1) % numPlayersInGame;
            // Then, locate the next *active* player from this new position.
            activePlayerPointer = locateNextActiveParticipant(activePlayerPointer, playerActiveFlags);
        }
    }

    // Once all rounds for the current scenario are complete, identify the surviving players.
    // Using a functional approach with `map`, `filter`, and `map` for clarity and immutability.
    const survivingParticipantIDs = playerActiveFlags
        .map((isCurrentlyActive, originalIndex) => ({ isCurrentlyActive, id: originalIndex + 1 })) // Pair status with 1-based ID
        .filter(participant => participant.isCurrentlyActive) // Keep only those who are still active
        .map(participant => participant.id); // Extract their 1-based IDs

    // Output the IDs of the surviving players, separated by spaces.
    console.log(survivingParticipantIDs.join(' '));
}