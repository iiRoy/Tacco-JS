// This module handles the processing of competition data and determines the final scores.
function processChallengeOutcome(challengeInputString) {
    // The raw input string is first divided into an array of lines.
    const inputLinesArray = challengeInputString.split("\n");

    // We focus on the very first line which contains the initial numerical parameters.
    // This line is then broken down into individual string tokens based on spaces.
    const firstLineTokens = inputLinesArray[0].split(" ");

    // Basic validation: Ensure we have enough tokens to parse.
    if (firstLineTokens.length < 3) {
        console.error("Error: Insufficient data tokens provided in the first line for score processing.");
        // In a real application, more robust error handling or default values might be used.
        // For this scenario, we'll simply exit if essential data is missing.
        return;
    }

    // Helper function for robust integer parsing, including trimming and default values.
    const safeParseInteger = (tokenString, fallbackValue = 0) => {
        const cleanedToken = tokenString.trim();
        const parsedValue = parseInt(cleanedToken, 10);
        return isNaN(parsedValue) ? fallbackValue : parsedValue;
    };

    // Extracting the initial scores and the deduction amount.
    // Variables have been renamed for distinctiveness from the original context.
    let playerAlphaScore = safeParseInteger(firstLineTokens[0]);
    let playerBetaScore = safeParseInteger(firstLineTokens[1]);
    let deductionQuota = safeParseInteger(firstLineTokens[2]);

    // Ensure all numerical inputs are non-negative, as scores and quotas typically are.
    playerAlphaScore = Math.max(0, playerAlphaScore);
    playerBetaScore = Math.max(0, playerBetaScore);
    deductionQuota = Math.max(0, deductionQuota);

    // Calculate the portion of the deduction that applies to the first player's score.
    // This ensures that the first player's score does not go below zero due to this deduction.
    let deductedFromAlpha = Math.min(playerAlphaScore, deductionQuota);

    // Determine the remaining deduction amount after applying as much as possible to the first player.
    let remainingDeduction = deductionQuota - deductedFromAlpha;

    // Update the first player's score based on the amount deducted from them.
    playerAlphaScore -= deductedFromAlpha;

    // Update the second player's score with any remaining deduction.
    // If 'remainingDeduction' is zero, the second player's score remains unchanged.
    playerBetaScore -= remainingDeduction;

    // Ensure the second player's score also does not fall below zero.
    playerBetaScore = Math.max(0, playerBetaScore);

    // Construct the final output string using a template literal for clarity.
    const finalScoresReport = `${playerAlphaScore} ${playerBetaScore}`;

    // Display the computed final scores to the console.
    console.log(finalScoresReport);
}

// The following code block is responsible for handling standard input/output operations.
// It reads the entire input from `/dev/stdin` (a common practice in competitive programming)
// and passes it to the main processing function. This part is typically left unaltered
// to maintain compatibility with the execution environment.
processChallengeOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));