// Helper function to adjust numerical values based on specific rules.
// This function transforms input string values into their corresponding game scores.
function processValue(inputValue) {
    const specialRuleNumber = 1; // The number that triggers a special score.
    const specialScoreResult = 14; // The score assigned when the special rule applies.

    // Convert the input string to an integer for comparison and calculation.
    const numericInput = parseInt(inputValue, 10);

    let finalScore; // Variable to hold the calculated score.

    // Apply the special rule: if the input value is 1, it gets a special high score.
    if (numericInput === specialRuleNumber) {
        finalScore = specialScoreResult;
    } else {
        // Otherwise, the score is simply the parsed numeric value.
        finalScore = numericInput;
    }

    // Return the determined score for the game.
    return finalScore;
}

// Function to encapsulate the output mechanism.
// This allows for potential future modifications to how results are displayed.
const displayGameResult = (messageContent) => {
    // Output the message to the console, optionally with a prefix for clarity.
    console.log(`Game Outcome: ${messageContent}`);
};

// Main function orchestrating the game logic.
// It takes raw input, processes it, determines the winner, and displays the result.
function executeGameLogic(rawInputString) {
    const inputSeparator = ' '; // The character used to separate values in the input string.
    const requiredInputParts = 2; // Expecting exactly two numerical inputs.

    // Clean and split the input string into an array of individual value strings.
    const partsArray = rawInputString.trim().split(inputSeparator);

    // Implement a guard clause to validate the input format.
    // If the number of parts is not as expected, an error message is displayed, and the function exits.
    if (partsArray.length !== requiredInputParts) {
        displayGameResult("Error: Malformed input. Please provide two space-separated numbers.");
        return; // Prevent further execution with invalid input.
    }

    // Process each part of the input string to get the actual game scores for both participants.
    const participantOneScore = processValue(partsArray[0]);
    const participantTwoScore = processValue(partsArray[1]);

    // Define constant strings for the various game outcomes.
    const outcomeTie = 'Tie';
    const outcomeWinnerOne = 'Player Alpha'; // Renamed from Alice
    const outcomeWinnerTwo = 'Player Beta';  // Renamed from Bob

    let finalVerdict; // This variable will store the message indicating the game's result.

    // Compare the scores to determine the winner or if it's a draw.
    if (participantOneScore === participantTwoScore) {
        finalVerdict = outcomeTie; // Scores are equal, it's a tie.
    } else if (participantOneScore > participantTwoScore) {
        finalVerdict = outcomeWinnerOne; // Participant one has a higher score.
    } else {
        finalVerdict = outcomeWinnerTwo; // Participant two has a higher score.
    }

    // Display the final verdict of the game.
    displayGameResult(finalVerdict);
}

// --- Application Entry Point ---

// Load the Node.js 'fs' (file system) module for reading input.
const fileSystemModule = require('fs');
// Define the standard input file path, common in competitive programming environments.
const standardInputLocation = '/dev/stdin';

try {
    // Attempt to read the content from the specified standard input file.
    // The content is expected to be a string and is decoded using UTF-8.
    const rawInputContent = fileSystemModule.readFileSync(standardInputLocation, 'utf8');

    // Pass the retrieved raw input content to the main game logic function for processing.
    executeGameLogic(rawInputContent);
} catch (fileReadError) {
    // Catch and handle any errors that occur during the file reading process.
    console.error("Failed to read input from standard input stream:", fileReadError.message);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
}