/**
 * @file This script calculates a competition score based on problem counts.
 * It's a re-engineered version of an existing scoring algorithm, enhanced
 * with additional input validation and a more verbose calculation process.
 *
 * The scoring formula is derived from:
 * 2^M * (1900*M + 100*(N-M))
 * where N is the total number of challenges and M is the number of solved challenges.
 */

/**
 * Orchestrates the computation of a final score for a programming competition.
 * It parses input parameters for total and solved problems, applies a complex
 * scoring formula, and outputs the result.
 *
 * @param {string} incomingProblemData - A string containing competition parameters.
 *   The expected format is a single line with two space-separated integers:
 *   "N M", where N is the total number of problems and M is the number of problems solved.
 */
function calculateCompetitionScore(incomingProblemData) {
    // Phase 1: Input Data Acquisition and Initial Validation
    // --------------------------------------------------------------------

    // Ensure the raw input string is not empty or just whitespace.
    if (!incomingProblemData || incomingProblemData.trim().length === 0) {
        console.error("Execution Aborted: No valid problem data was supplied for processing.");
        return; // Terminate execution if input is absent.
    }

    // Break down the multi-line input (though typically single-line for this problem)
    // into an array of individual text lines.
    const contentLines = incomingProblemData.trim().split('\n');

    // Verify that at least one line of configuration data exists.
    if (contentLines.length === 0) {
        console.error("Execution Aborted: The input stream did not contain any discernible lines of data.");
        return;
    }

    // Extract the primary configuration line, which should contain N and M.
    const configurationLine = contentLines[0];

    // Split this configuration line by spaces to isolate individual parameter tokens.
    const parameterTokens = configurationLine.split(' ');

    // Confirm that both expected parameters (N and M) are present.
    if (parameterTokens.length < 2) {
        console.error("Execution Aborted: Insufficient numerical parameters detected on the configuration line. Expected N and M.");
        return;
    }

    // Phase 2: Parameter Parsing and Numeric Validation
    // --------------------------------------------------------------------

    // Convert the string tokens into their numerical equivalents.
    // Using `Number()` is a concise way to parse integers and floats.
    const totalChallengesAvailable = Number(parameterTokens[0]);
    const challengesSuccessfullyCompleted = Number(parameterTokens[1]);

    // Perform comprehensive validation on the parsed numerical values.
    // - Check for non-numeric conversion results (NaN).
    // - Ensure problem counts are non-negative.
    // - Verify that solved problems do not exceed total problems.
    if (isNaN(totalChallengesAvailable) || isNaN(challengesSuccessfullyCompleted) ||
        totalChallengesAvailable < 0 || challengesSuccessfullyCompleted < 0 ||
        challengesSuccessfullyCompleted > totalChallengesAvailable)
    {
        console.error(`Execution Aborted: Invalid numerical values provided for challenges.
            Total: ${parameterTokens[0]} (Parsed: ${totalChallengesAvailable})
            Solved: ${parameterTokens[1]} (Parsed: ${challengesSuccessfullyCompleted})
            Please ensure N and M are non-negative integers and M <= N.`);
        return;
    }

    // Phase 3: Score Component Calculation
    // --------------------------------------------------------------------

    // Calculate points awarded for each successfully completed challenge.
    const pointsFromSolvedProblems = 1900 * challengesSuccessfullyCompleted;

    // Determine the number of challenges that were not solved.
    const numberOfUnsolvedChallenges = totalChallengesAvailable - challengesSuccessfullyCompleted;

    // Calculate points deducted or awarded for unsolved problems.
    const pointsFromUnsolvedProblems = 100 * numberOfUnsolvedChallenges;

    // Sum the points from both solved and unsolved categories to get a base score.
    const aggregateBaseScore = pointsFromSolvedProblems + pointsFromUnsolvedProblems;

    // Compute the exponential multiplier (2 raised to the power of solved challenges).
    // This part is rewritten from Math.pow(2, M) to an iterative multiplication
    // to demonstrate a Type III structural transformation.
    let exponentialScoreMultiplier = 1;
    for (let currentPower = 0; currentPower < challengesSuccessfullyCompleted; currentPower++) {
        exponentialScoreMultiplier *= 2;
    }

    // Phase 4: Final Score Determination and Output
    // --------------------------------------------------------------------

    // Apply the exponential multiplier to the base score to get the final result.
    const ultimateCompetitionResult = exponentialScoreMultiplier * aggregateBaseScore;

    // Present the final computed score to the user via standard output.
    // Using a different string formatting compared to the original.
    console.log(`The competition's final calculated score is: ${ultimateCompetitionResult}`);
}

// Entry point for the script's execution.
// This immediately invoked function expression (IIFE) handles reading input
// from the standard input stream and delegates it to the main calculation logic.
(function executeScoreCalculation() {
    try {
        // Utilize Node.js file system module to read all content from stdin.
        // Specifying 'node:fs' for clarity, though 'fs' is typically sufficient.
        const stdinContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
        calculateCompetitionScore(stdinContent);
    } catch (ioError) {
        // Catch and report any errors that occur during the file reading process.
        console.error("An error occurred while attempting to read from /dev/stdin:", ioError.message);
        // In a production scenario, one might log this error and exit with a non-zero code.
    }
})();