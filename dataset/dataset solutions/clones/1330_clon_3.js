'use strict';

// This immediately-invoked function expression (IIFE) encapsulates the entire logic
// It receives the raw file content as a buffer from standard input.
((rawInputContentBuffer) => {

    // --- Configuration Constants ---
    // Define point values for different game outcomes to improve readability
    const POINTS_FOR_WIN = 3;
    const POINTS_FOR_DRAW = 1;

    // --- Helper Function for Round Processing ---
    // This function processes a single game round's data
    // and updates the accumulated scores for two competitors.
    const processGameRound = (currentScoresAccumulator, roundTextEntry) => {
        // Defensive check: Skip empty or whitespace-only lines
        if (!roundTextEntry || roundTextEntry.trim() === '') {
            return currentScoresAccumulator;
        }

        // Split the round string into individual score components
        const competitorScoreStrings = roundTextEntry.split(' ');

        // Basic input validation: Expecting exactly two scores per round
        if (competitorScoreStrings.length !== 2) {
            console.warn(`[Warning] Skipping malformed game round entry: "${roundTextEntry}". Expected two scores.`);
            return currentScoresAccumulator;
        }

        // Convert string scores to integers for accurate numerical comparison
        const competitorA_Score = parseInt(competitorScoreStrings[0], 10);
        const competitorB_Score = parseInt(competitorScoreStrings[1], 10);

        // Validate that parsed scores are indeed numbers
        if (isNaN(competitorA_Score) || isNaN(competitorB_Score)) {
            console.warn(`[Warning] Skipping round with non-numeric scores: "${roundTextEntry}".`);
            return currentScoresAccumulator;
        }

        // --- Determine Round Outcome and Update Scores ---
        // Using an if-else-if structure instead of the original switch(true)
        if (competitorA_Score > competitorB_Score) {
            currentScoresAccumulator[0] += POINTS_FOR_WIN; // Competitor A wins
        } else if (competitorA_Score < competitorB_Score) {
            currentScoresAccumulator[1] += POINTS_FOR_WIN; // Competitor B wins
        } else {
            // It's a tie, both competitors get draw points
            currentScoresAccumulator[0] += POINTS_FOR_DRAW;
            currentScoresAccumulator[1] += POINTS_FOR_DRAW;
        }

        return currentScoresAccumulator; // Return the updated scores for the next iteration
    };

    let allInputSegments;
    try {
        // Attempt to convert the input buffer to a UTF-8 string and split by newline.
        allInputSegments = rawInputContentBuffer.toString('utf8').split('\n');
    } catch (parsingError) {
        // Handle potential errors during input processing
        console.error(`[Error] Failed to parse input content: ${parsingError.message}`);
        console.log('0 0'); // Output default scores on critical failure
        return;
    }

    // Filter out any empty strings resulting from splitting, especially if input ends with a newline.
    const cleanedInputLines = allInputSegments.filter(segment => segment.trim() !== '');

    // Check if there's any meaningful input after cleaning
    if (cleanedInputLines.length === 0) {
        console.log('0 0'); // No valid input lines found, print default scores
        return;
    }

    // --- Extract Number of Game Rounds ---
    // The first line indicates the total number of game rounds to process.
    // Use `shift()` to remove and retrieve the first element.
    const numberOfRoundsString = cleanedInputLines.shift();
    const totalGameRoundsExpected = parseInt(numberOfRoundsString, 10);

    // Validate the extracted number of rounds
    if (isNaN(totalGameRoundsExpected) || totalGameRoundsExpected < 0) {
        console.error(`[Error] Invalid or missing round count in input: "${numberOfRoundsString}". Expected a non-negative integer.`);
        console.log('0 0'); // Output default scores for invalid round count
        return;
    }

    // --- Prepare Game Entries for Processing ---
    // Slice the array to get only the actual game data lines.
    // Use Math.min to prevent reading beyond available lines if the count is incorrect.
    const actualGameDataEntries = cleanedInputLines.slice(0, Math.min(totalGameRoundsExpected, cleanedInputLines.length));

    // Initialize the scores for two players, starting both at zero.
    // This array will hold [player1_score, player2_score].
    const initialScoreboardState = [0, 0];

    // --- Calculate Final Scores ---
    // Use the `reduce` method to iterate over each game entry and accumulate scores.
    const finalMatchResults = actualGameDataEntries.reduce(processGameRound, initialScoreboardState);

    // --- Format and Output Results ---
    // Join the final scores with a space for the desired output format.
    const outputScoreString = finalMatchResults.join(' ');

    // Print the computed final scores to standard output.
    console.log(outputScoreString);

// The external file system module is used to read the input from /dev/stdin.
// This part is the invocation context for the IIFE, not part of its internal logic.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));