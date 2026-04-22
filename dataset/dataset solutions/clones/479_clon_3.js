// This script processes multiple game rounds to determine surviving players
// based on a FizzBuzz-like elimination game.
// It reads game parameters and player utterances from standard input.

// Acquire the Node.js file system module for input operations.
const fileSystemModule = require('fs');

// A utility function to read all lines from a specified input source.
// It performs initial data preparation: reading, trimming, and splitting into individual lines.
function readAllInputLines(sourcePath) {
    // Read the entire file content as a UTF-8 string.
    const rawContent = fileSystemModule.readFileSync(sourcePath, 'utf8');
    // Trim any leading/trailing whitespace from the whole content,
    // then split it into an array of strings based on newline characters.
    // This ensures no empty lines from trailing newlines affect processing.
    return rawContent.trim().split('\n');
}

// A helper function to compute the mathematically correct FizzBuzz response
// for a given turn number.
function determineCorrectFizzBuzzResponse(currentTurnValue) {
    let calculatedResponse = '';
    // Check divisibility by 3.
    const isDivisibleByThree = (currentTurnValue % 3 === 0);
    // Check divisibility by 5.
    const isDivisibleByFive = (currentTurnValue % 5 === 0);

    // Concatenate "Fizz" and "Buzz" based on divisibility rules.
    if (isDivisibleByThree) {
        calculatedResponse += 'Fizz';
    }
    if (isDivisibleByFive) {
        calculatedResponse += 'Buzz';
    }

    // If no special FizzBuzz rule applied, the number itself is the correct response.
    // Convert the number to a string for consistent comparison with player utterances.
    return calculatedResponse === '' ? String(currentTurnValue) : calculatedResponse;
}

// Global array to hold all processed input lines, enabling sequential extraction.
let gameInputLines = readAllInputLines('/dev/stdin');

// A counter to keep track of how many game scenarios have been processed.
let processedScenarioCount = 0;

// The main program loop. It continues to process game scenarios
// as long as there are input lines available and the termination signal (0 0)
// has not been encountered.
while (gameInputLines.length > 0) {
    processedScenarioCount++; // Increment the scenario counter for the current game.

    // Extract the first line for the current scenario, which contains game parameters.
    const currentParameterString = gameInputLines.shift();
    // Basic guard: if for some reason a parameter line is missing/empty, break.
    if (!currentParameterString) {
        break;
    }

    // Parse the parameters: number of initial players and total number of rounds.
    const gameParameters = currentParameterString.split(' ').map(Number);

    const initialPlayerCount = gameParameters[0]; // Corresponds to 'M' in original.
    const totalRoundCount = gameParameters[1];    // Corresponds to 'N' in original.

    // Check for the termination condition: 0 players and 0 rounds.
    // If this condition is met, it signals the end of all game processing.
    if (initialPlayerCount === 0 && totalRoundCount === 0) {
        break; // Exit the main processing loop.
    }

    // Initialize the collection of active participants.
    // Players are numbered starting from 1 up to the initial player count.
    const activeParticipants = Array.from({ length: initialPlayerCount }, (_, participantIdx) => participantIdx + 1);

    // Collect all reported utterances (what players said) for the current game's rounds.
    const reportedRoundUtterances = [];
    for (let roundLineIdx = 0; roundLineIdx < totalRoundCount; roundLineIdx++) {
        // Ensure that there are enough input lines remaining for all expected rounds.
        if (gameInputLines.length === 0) {
            // If input runs out prematurely, stop collecting utterances for this scenario.
            // The simulation will proceed with fewer rounds than initially specified.
            break;
        }
        reportedRoundUtterances.push(gameInputLines.shift());
    }

    // Variables for simulating the game turn by turn.
    let currentTurnValue = 1; // The current number being called out in the FizzBuzz game.
    let currentParticipantPointer = 0; // Index in the activeParticipants array for the player whose turn it is.

    // Iterate through each reported utterance to simulate the game's progression.
    // This loop executes for as many utterances as were successfully collected.
    for (let utteranceIndex = 0; utteranceIndex < reportedRoundUtterances.length; utteranceIndex++) {
        const playerReportedWord = reportedRoundUtterances[utteranceIndex];

        // Calculate what the player *should* have said for the current turn.
        const correctFizzBuzzResponse = determineCorrectFizzBuzzResponse(currentTurnValue);

        // Compare the player's reported word with the correct response.
        if (playerReportedWord !== correctFizzBuzzResponse) {
            // If the player made a mistake, they are eliminated from the game.
            // The `splice` method removes the player at the current pointer.
            // Note: `splice` modifies the array in-place, changing its length and shifting elements.
            activeParticipants.splice(currentParticipantPointer, 1);
        }

        // Advance the participant pointer for the next turn.
        // This happens regardless of whether the current player was eliminated or not.
        // If a player was eliminated, the next player in the original sequence
        // (who is now at a potentially lower index due to the splice) will take the turn.
        currentParticipantPointer++;

        // Wrap the participant pointer around the array of remaining active players.
        // This ensures a continuous round-robin turn order among survivors.
        if (activeParticipants.length > 0) {
             currentParticipantPointer %= activeParticipants.length;
        } else {
            // If all players have been eliminated, reset the pointer.
            // No one is left to take a turn, but the game might still process remaining rounds.
            currentParticipantPointer = 0;
        }

        // Advance to the next turn number for the FizzBuzz sequence.
        currentTurnValue++;
    }

    // After all rounds for the current game scenario are processed,
    // output the numbers of the remaining active participants, joined by spaces.
    // If no participants remain, an empty string will be printed.
    console.log(activeParticipants.join(' '));
}

// The script concludes after all game scenarios have been processed or the termination
// signal is received.