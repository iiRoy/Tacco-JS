// This script processes game statistics from standard input to determine player outcomes.

// Core module for file system operations.
const fileSystemHandler = require('fs');

// Defines the source for input data, typically standard input.
const dataSourcePath = '/dev/stdin';

// Specifies the character encoding for reading the input file.
const textEncodingFormat = 'UTF-8';

// --- Phase 1: Input Acquisition and Initial Validation ---

let incomingStreamContent;
try {
    // Attempt to synchronously read all content from the specified data source.
    incomingStreamContent = fileSystemHandler.readFileSync(dataSourcePath, textEncodingFormat);
} catch (readError) {
    // If an error occurs during file reading, log it and terminate the process.
    console.error("Error encountered while accessing input stream:", readError.message);
    process.exit(1); // Exit with a non-zero status indicating an error.
}

// Critical check: Ensure that some data was actually received.
if (!incomingStreamContent || incomingStreamContent.toString().trim().length === 0) {
    console.error("Input stream was empty or contained no meaningful data. Cannot proceed.");
    process.exit(1);
}

// Normalize the input: remove leading/trailing whitespace and split into an array of lines.
const parsedInputLines = incomingStreamContent.toString().trim().split('\n');

// Minimum expected number of lines: one for configuration, one for player answers.
const MINIMUM_REQUIRED_LINES = 2;
if (parsedInputLines.length < MINIMUM_REQUIRED_LINES) {
    console.error(`Insufficient data lines provided. Expected at least ${MINIMUM_REQUIRED_LINES}, but got ${parsedInputLines.length}.`);
    process.exit(1);
}

// --- Phase 2: Configuration Parameter Extraction ---

// The very first line of input holds the game's global parameters.
const configurationTokens = parsedInputLines[0].split(' ');

// Parse and convert the essential game parameters to integers.
// N: Total number of participants in the game.
const totalParticipants = parseInt(configurationTokens[0], 10);
// K: The starting point value for every participant.
const initialPlayerScore = parseInt(configurationTokens[1], 10);
// Q: Points deducted from each participant's score for every question they did NOT answer correctly.
const scoreDeductionPerQuestion = parseInt(configurationTokens[2], 10);

// Validate that the parsed parameters are indeed valid numbers.
if (isNaN(totalParticipants) || isNaN(initialPlayerScore) || isNaN(scoreDeductionPerQuestion)) {
    console.error("One or more game configuration parameters are not valid numbers. Please check input format.");
    process.exit(1);
}

// --- Phase 3: Processing Correct Answer Records ---

// The subsequent lines (after the first) list the 1-based indices of players who answered correctly.
const rawCorrectAnswerRecords = parsedInputLines.slice(1);

// Convert each record string into a numerical player identifier, filtering out any blank entries.
const successfulPlayerIdentifiers = rawCorrectAnswerRecords
    .filter(lineSegment => lineSegment.trim() !== '') // Remove any empty lines that might result from trailing newlines.
    .map(numericString => parseInt(numericString.trim(), 10)); // Convert to actual integer IDs.

// --- Phase 4: Score Initialization and Update Logic ---

// Determine the base score each participant starts with, considering the initial points and deduction.
const calculatedBaseScore = initialPlayerScore - scoreDeductionPerQuestion;

// Initialize an array to store the current score for each participant.
// All participants begin with the calculated base score.
const participantScores = new Array(totalParticipants);
for (let p_idx = 0; p_idx < totalParticipants; p_idx++) {
    participantScores[p_idx] = calculatedBaseScore;
}

// Now, iterate through the list of successful player identifiers.
// For each successful answer, the corresponding participant's score is incremented.
for (const winnerNumericId of successfulPlayerIdentifiers) {
    // Convert the 1-based player ID to a 0-based array index.
    const arrayTargetIndex = winnerNumericId - 1;

    // Implement a robust check to ensure the player ID is within the valid range.
    if (arrayTargetIndex >= 0 && arrayTargetIndex < totalParticipants) {
        participantScores[arrayTargetIndex]++; // Increment the score for the winning participant.
    } else {
        // Log a non-critical warning if an invalid player ID is encountered.
        console.warn(`Warning: Participant ID '${winnerNumericId}' is out of bounds (1 to ${totalParticipants}). Skipping update.`);
    }
}

// --- Phase 5: Final Outcome Determination and Display ---

// Define the critical threshold for a participant to be considered successful.
const victoryConditionThreshold = 0; // A score strictly greater than zero implies success.

// A dedicated function to encapsulate the logic for displaying a participant's status.
const emitPlayerOutcome = (currentScore) => {
    if (currentScore > victoryConditionThreshold) {
        console.log('Yes'); // Participant has a positive score, indicating success.
    } else {
        console.log('No');  // Participant's score is zero or negative, indicating failure.
    }
};

// Iterate through the final scores of all participants and display their respective outcomes.
for (const finalIndividualScore of participantScores) {
    emitPlayerOutcome(finalIndividualScore);
}

// Script execution concludes.