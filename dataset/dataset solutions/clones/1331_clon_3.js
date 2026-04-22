(function(initialData) {
    // This section processes the raw string input into an array of individual lines.
    const inputLines = initialData.split('\n');

    // The first line of input typically contains metadata, such as the total count of items
    // to be processed. In this specific scenario, the problem statement implies a fixed number
    // of rounds (3), making the value of 'n' from the first line non-essential for the core
    // logic. We parse it for completeness but do not utilize its value further.
    const declaredTotalMatchRounds = parseInt(inputLines.shift(), 10); // Discarding 'n'

    // Define a constant for the actual number of match rounds to be processed,
    // as per the problem's implicit requirement of 3 rounds.
    const FIXED_MATCH_ROUNDS_TO_PROCESS = 3;

    // Initialize cumulative scores for Player One (T) and Player Two (H).
    let playerOneCumulativeScore = 0;
    let playerTwoCumulativeScore = 0;

    /**
     * Determines the points awarded to each player for a single round based on their scores.
     * @param {number} p1Score - The score of Player One for the current round.
     * @param {number} p2Score - The score of Player Two for the current round.
     * @returns {{p1: number, p2: number}} An object containing points awarded to p1 and p2.
     */
    const determineRoundPoints = (p1Score, p2Score) => {
        if (p1Score > p2Score) {
            // Player One wins the round
            return { p1: 3, p2: 0 };
        } else if (p1Score < p2Score) {
            // Player Two wins the round
            return { p1: 0, p2: 3 };
        } else {
            // The round is a draw
            return { p1: 1, p2: 1 };
        }
    };

    // Iterate through the predefined number of match rounds to calculate overall scores.
    for (let roundIterator = 0; roundIterator < FIXED_MATCH_ROUNDS_TO_PROCESS; roundIterator++) {
        // Essential check: Ensure there are enough lines remaining in the input
        // to process the current round. This is a robustness guard.
        if (inputLines.length === 0) {
            console.error(`Insufficient input data for round ${roundIterator + 1}. Expected ${FIXED_MATCH_ROUNDS_TO_PROCESS} rounds.`);
            break; // Exit loop if no more input lines are available
        }

        // Extract the line corresponding to the current round.
        const currentRoundDetails = inputLines.shift();

        // Validate the extracted line for emptiness before processing.
        if (!currentRoundDetails || currentRoundDetails.trim() === '') {
             console.error(`Empty or malformed input line encountered for round ${roundIterator + 1}. Skipping.`);
             continue; // Proceed to the next iteration if the line is invalid
        }

        // Split the round details line into individual score strings.
        const scoreComponents = currentRoundDetails.split(' ');

        // Validate that two score components were successfully extracted.
        if (scoreComponents.length < 2) {
            console.error(`Malformed score data for round ${roundIterator + 1}: "${currentRoundDetails}". Skipping.`);
            continue; // Skip current round if scores are not properly formatted
        }

        // Parse the string scores into integer values.
        const playerOneRoundScore = parseInt(scoreComponents[0], 10);
        const playerTwoRoundScore = parseInt(scoreComponents[1], 10);

        // Utilize the helper function to calculate points for the current round.
        const awardedPoints = determineRoundPoints(playerOneRoundScore, playerTwoRoundScore);

        // Aggregate the points earned in this round to the overall cumulative scores.
        playerOneCumulativeScore += awardedPoints.p1;
        playerTwoCumulativeScore += awardedPoints.p2;
    }

    // Output the final cumulative scores for both players using a modern template literal.
    console.log(`${playerOneCumulativeScore} ${playerTwoCumulativeScore}`);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));