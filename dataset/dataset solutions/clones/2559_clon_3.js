function processContestData(rawData) {

    // Split the entire raw input string into an array of individual lines.
    const inputLines = rawData.split('\n');

    // --- Input Validation and Parsing of Initial Configuration ---

    // Guard clause: Ensure there's at least one line for configuration.
    if (inputLines.length === 0 || inputLines[0].trim() === '') {
        // In a real application, this might throw an error or return a specific status.
        // For this context, we'll log an error and exit.
        console.error("Error: Provided input data is empty or malformed at configuration line.");
        return;
    }

    // Extract and parse the primary parameters from the first line.
    const configurationTokens = inputLines[0].split(' ');

    // Use Number() for flexibility, and parseInt() with radix for clarity.
    const totalParticipants = Number(configurationTokens[0]); // Original 'N'
    const penaltyThreshold = parseInt(configurationTokens[1], 10); // Original 'K'
    const totalGameRounds = parseInt(configurationTokens[2], 10); // Original 'Q'

    // Additional validation for parsed numeric parameters.
    if (isNaN(totalParticipants) || isNaN(penaltyThreshold) || isNaN(totalGameRounds) ||
        totalParticipants <= 0 || penaltyThreshold < 0 || totalGameRounds < 0) {
        console.error("Error: One or more configuration parameters are invalid or non-numeric.");
        return;
    }

    // --- Core Logic Transformation (Type III Change) ---

    // Instead of directly tracking 'penalties' (times not selected),
    // we will first track 'correct selections' (times selected).
    // This is a significant structural change.
    // Initialize an array to store how many times each participant was chosen correctly.
    // Array is 0-indexed, so participant ID 'X' corresponds to index 'X-1'.
    const participantCorrectSelectionCounts = new Array(totalParticipants).fill(0);

    // Iterate through each game round to record the outcomes.
    // The loop starts from the second line (index 1) as the first line is config.
    // 'roundNumber' here is 1-indexed for logical clarity, matching original 'i'.
    for (let roundNumber = 1; roundNumber <= totalGameRounds; roundNumber++) {

        const currentRoundLineIndex = roundNumber; // Map 1-indexed round number to 0-indexed line array

        // Guard against insufficient input lines for all declared rounds.
        if (currentRoundLineIndex >= inputLines.length || inputLines[currentRoundLineIndex].trim() === '') {
            console.error(`Warning: Input line for round ${roundNumber} is missing or empty. Skipping this round.`);
            continue; // Move to the next round if data is missing
        }

        // Parse the ID of the participant selected in the current round.
        const selectedParticipantIdString = inputLines[currentRoundLineIndex].trim();
        const selectedParticipantIdentifier = parseInt(selectedParticipantIdString, 10);

        // Validate the participant ID.
        if (isNaN(selectedParticipantIdentifier) ||
            selectedParticipantIdentifier < 1 ||
            selectedParticipantIdentifier > totalParticipants) {
            console.error(`Warning: Invalid participant ID '${selectedParticipantIdString}' found in round ${roundNumber}. Skipping update for this round.`);
            continue;
        }

        // Convert the 1-indexed participant ID to a 0-indexed array index.
        const participantArrayPosition = selectedParticipantIdentifier - 1;

        // Increment the count for the participant who was selected in this round.
        participantCorrectSelectionCounts[participantArrayPosition]++;
    }

    // --- Deriving Final Penalty Scores and Generating Output ---

    // Create an array to store the final penalty scores for each participant.
    const finalPenaltyScores = new Array(totalParticipants);

    // A helper array to collect the output messages before printing.
    const finalOutcomeMessages = [];

    // Iterate through each participant to calculate their total penalty.
    // 'playerCurrentIndex' maps to original 'j'.
    for (let playerCurrentIndex = 0; playerCurrentIndex < totalParticipants; playerCurrentIndex++) {

        // Retrieve how many times this participant was selected correctly.
        const timesParticipantWasSelected = participantCorrectSelectionCounts[playerCurrentIndex];

        // Calculate the 'penalty': total rounds minus the times they were selected.
        // This is equivalent to the original logic's 'array[j]++' condition.
        const calculatedPenaltyPoints = totalGameRounds - timesParticipantWasSelected;

        // Store the calculated penalty.
        finalPenaltyScores[playerCurrentIndex] = calculatedPenaltyPoints;

        // Determine the outcome message based on the penalty threshold.
        // Rewriting the ternary operator into a more explicit if/else block (Type III change).
        let currentParticipantResult;
        if (calculatedPenaltyPoints >= penaltyThreshold) {
            currentParticipantResult = 'No'; // Participant failed to meet criteria
        } else {
            currentParticipantResult = 'Yes'; // Participant met criteria
        }
        finalOutcomeMessages.push(currentParticipantResult);
    }

    // Print all collected outcome messages, each on a new line.
    // This is a rewrite of the output mechanism (Type III change).
    console.log(finalOutcomeMessages.join('\n'));
}

// Entry point: Read input from standard input and pass it to the processing function.
// This part remains largely the same to ensure compatibility with typical competitive programming environments.
processContestData(require("fs").readFileSync("/dev/stdin", "utf8"));