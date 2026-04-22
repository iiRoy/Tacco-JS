// This module is responsible for reading input from the file system.
const inputFileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// The raw input string is split into an array of individual lines,
// after trimming any leading or trailing whitespace from the entire content.
let availableInputLines = inputFileContent.trim().split("\n");

// Define constants for the FizzBuzz game rules.
const GAME_RULE_FIZZ_NUMBER = 3;
const GAME_RULE_BUZZ_NUMBER = 5;
// The FizzBuzz condition is when a number is divisible by both Fizz and Buzz numbers.
const GAME_RULE_FIZZBUZZ_NUMBER = GAME_RULE_FIZZ_NUMBER * GAME_RULE_BUZZ_NUMBER;

// Helper function to calculate the correct FizzBuzz output for a given round number.
// This encapsulates the core game logic for determining the expected response.
const calculateExpectedGameResponse = (roundIdentifier) => {
    const isDivisibleByFizz = (roundIdentifier % GAME_RULE_FIZZ_NUMBER === 0);
    const isDivisibleByBuzz = (roundIdentifier % GAME_RULE_BUZZ_NUMBER === 0);

    if (isDivisibleByFizz && isDivisibleByBuzz) {
        return "FizzBuzz";
    } else if (isDivisibleByFizz) {
        return "Fizz";
    } else if (isDivisibleByBuzz) {
        return "Buzz";
    } else {
        // If no special condition is met, the expected response is the round number itself, as a string.
        return String(roundIdentifier);
    }
};

// Helper function to find the index of the next active player in a circular fashion.
// It starts checking from the player immediately following the 'lastPlayerIndex'.
const findNextActivePlayerIndex = (lastPlayerIndex, playerActivityStatus, totalPlayerCount) => {
    let candidateIndex = lastPlayerIndex;
    // Iterate until an active player is found. This loop is guaranteed to terminate
    // as long as at least one player is active (which is checked before calling this function).
    do {
        // Move to the next player, wrapping around to the beginning of the array if necessary.
        candidateIndex = (candidateIndex + 1) % totalPlayerCount;
    } while (!playerActivityStatus[candidateIndex]); // Continue if the current player is not active (false).
    return candidateIndex;
};

// Main loop to process each distinct game scenario provided in the input data.
// Each iteration handles one complete game from setup to result output.
while (true) {
    // Read the configuration line for the current game (number of players 'P' and rounds 'R').
    const currentConfigurationLine = availableInputLines.shift();

    // If there are no more lines, it implies the end of input or malformed input.
    if (currentConfigurationLine === undefined) {
        break;
    }

    const gameParameters = currentConfigurationLine.split(" ");

    // The game terminates if the configuration line is "0 0".
    if (gameParameters[0] === '0' && gameParameters[1] === '0') {
        break;
    }

    // Parse the numerical values for players and rounds from the configuration.
    const numberOfPlayers = parseInt(gameParameters[0], 10);
    const numberOfRounds = parseInt(gameParameters[1], 10);

    // Initialize an array to keep track of each player's status (active/inactive).
    // All players start as active (true).
    const playerEliminationTracker = Array(numberOfPlayers).fill(true);

    // A counter for the number of players still in the game.
    let currentActivePlayerCount = numberOfPlayers;

    // Initialize the game's state variables for round tracking and current player turn.
    let gameRoundCounter = 0; // Represents the 1-indexed round number for FizzBuzz logic.
    let playerWhoseTurnItIs = 0; // Represents the 0-indexed player currently taking their turn.

    // Loop through each round of the game, up to the specified `numberOfRounds`.
    // The loop also terminates early if only one player remains active.
    for (let roundIteration = 0; roundIteration < numberOfRounds; roundIteration++) {
        // If only one player is left, the game concludes early.
        if (currentActivePlayerCount <= 1) {
            break;
        }

        gameRoundCounter++; // Increment the round number for FizzBuzz calculation.

        // Get the response provided by the player for the current round.
        const playerActualResponse = availableInputLines.shift();
        // Guard clause: If input lines run out prematurely, it indicates malformed input.
        if (playerActualResponse === undefined) {
            break;
        }

        // Determine what the correct response should have been for this round.
        const correctGameResponse = calculateExpectedGameResponse(gameRoundCounter);

        // Compare the player's response with the correct one.
        if (playerActualResponse !== correctGameResponse) {
            // If the response is incorrect, the player is eliminated.
            playerEliminationTracker[playerWhoseTurnItIs] = false;
            currentActivePlayerCount--; // Decrement the count of active players.
        }

        // After a player's turn, check again if the game should end (only one player left).
        if (currentActivePlayerCount <= 1) {
            break;
        }

        // Prepare for the next round by determining which active player goes next.
        // The `findNextActivePlayerIndex` function handles circular iteration and skipping eliminated players.
        playerWhoseTurnItIs = findNextActivePlayerIndex(playerWhoseTurnItIs, playerEliminationTracker, numberOfPlayers);
    }

    // After the game concludes (either all rounds played or only one player left),
    // collect the 1-indexed numbers of all players who are still active.
    const survivingPlayerIdentifiers = [];
    playerEliminationTracker.forEach((isStillActive, playerZeroIndex) => {
        if (isStillActive) {
            survivingPlayerIdentifiers.push(playerZeroIndex + 1); // Convert 0-indexed to 1-indexed.
        }
    });

    // Output the list of surviving player identifiers, separated by spaces.
    console.log(survivingPlayerIdentifiers.join(" "));
}