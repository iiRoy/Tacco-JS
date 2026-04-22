'use strict';

/**
 * Processes contest submission records to determine the final score.
 * Calculates the total number of uniquely accepted problems and the cumulative penalty minutes.
 * Penalty is incurred for each Wrong Answer (WA) submission for a problem *before* it is Accepted (AC).
 * Once a problem is Accepted, subsequent submissions for that problem (regardless of outcome)
 * do not further affect the score.
 *
 * @param {string} rawInputData - The complete raw input string from stdin.
 *   Expected format:
 *   Line 1: N M (N = number of problems, M = total submissions - N is unused, M implicitly handled)
 *   Subsequent lines: problemId status (e.g., "1 AC", "2 WA")
 */
function ContestScoreCalculator(rawInputData) {
    // Normalize input: trim leading/trailing whitespace and split into individual lines.
    const processedLines = rawInputData.trim().split('\n');

    // The first line contains general contest parameters (e.g., total problems, total submissions).
    // While parsed, these specific values are not directly used in the scoring logic below,
    // as the number of submissions is implicitly determined by the input array length.
    const contestConfiguration = processedLines[0].split(' ').map(str => parseInt(str.trim(), 10));
    // const totalProblemCount = contestConfiguration[0]; // N: Total number of distinct problems in the contest.
    // const totalSubmissionCount = contestConfiguration[1]; // M: Total number of submission events.

    // Extract all submission entries, skipping the initial configuration line.
    const rawSubmissionRecords = processedLines.slice(1);

    // Transform each raw submission string ("problemId status") into a structured array [Number, String].
    // Includes basic parsing validation to ensure data integrity.
    const structuredSubmissionEvents = rawSubmissionRecords.map(submissionLine => {
        const parts = submissionLine.split(' ');
        // If a submission line is malformed (e.g., not "ID STATUS"), it's considered invalid.
        if (parts.length !== 2) {
            // In a production scenario, one might log this error or throw an exception.
            // For this exercise, we'll return null and filter it out.
            return null;
        }
        const problemIdentifier = parseInt(parts[0].trim(), 10);
        const submissionOutcome = parts[1].trim();
        return [problemIdentifier, submissionOutcome];
    }).filter(Boolean); // Remove any null entries resulting from malformed input lines.

    // --- Initialize Scoring Variables ---
    let finalAcceptedProblemsCount = 0;
    let overallPenaltyMinutes = 0;

    // This object tracks Wrong Answer (WA) counts for each problem *before* it gets an AC.
    // Key: problem ID, Value: count of WAs for that problem.
    const problemWrongAttemptsTracker = {}; // Example: { 1: 2, 3: 1 }

    // This Set efficiently stores the IDs of problems that have already been successfully Accepted.
    // This prevents double-counting ACs and ensures WAs after an AC do not add to penalty.
    const successfullyAcceptedProblems = new Set();

    // --- Process Each Submission Event ---
    for (const currentEvent of structuredSubmissionEvents) {
        const problemId = currentEvent[0];
        const status = currentEvent[1];

        // --- Robustness: Input Validation for individual submission ---
        // Ensure the problem ID is a valid positive integer.
        if (isNaN(problemId) || problemId <= 0) {
            // console.error(`Invalid problem ID encountered: ${problemId}. Skipping submission.`);
            continue; // Skip this submission and move to the next.
        }

        // Ensure the submission status is one of the recognized types.
        if (status !== 'AC' && status !== 'WA') {
            // console.error(`Unknown submission status: '${status}' for problem ${problemId}. Skipping.`);
            continue; // Skip this submission.
        }

        // --- Core Scoring Logic ---
        // If this problem has already been marked as accepted, then any further submissions
        // for it are irrelevant to the final score (no more ACs, no more penalties).
        if (successfullyAcceptedProblems.has(problemId)) {
            continue; // Move to the next submission event.
        }

        // Differentiate processing based on the submission status.
        if (status === 'AC') {
            // A problem has been Accepted for the first time.
            finalAcceptedProblemsCount++;

            // Add any accumulated Wrong Answer penalties for this specific problem.
            // If there were no WAs for this problem before this AC, its count is 0.
            const priorWrongAttempts = problemWrongAttemptsTracker[problemId] || 0;
            overallPenaltyMinutes += priorWrongAttempts;

            // Mark this problem as successfully accepted to prevent future score changes for it.
            successfullyAcceptedProblems.add(problemId);

            // Clean up: Remove the problem from the WA tracker as it's now solved.
            // This is an optimization; it doesn't affect correctness but keeps the map smaller.
            delete problemWrongAttemptsTracker[problemId];

        } else if (status === 'WA') {
            // A Wrong Answer has occurred for a problem that is not yet accepted.
            // Increment the WA count for this problem. This penalty will only be applied
            // if and when this problem eventually gets an AC.
            problemWrongAttemptsTracker[problemId] = (problemWrongAttemptsTracker[problemId] || 0) + 1;
        }
        // No 'else' branch is needed for other statuses due to the earlier validation checks.
    }

    // Output the final calculated scores: total accepted problems and total penalty minutes.
    console.log(`${finalAcceptedProblemsCount} ${overallPenaltyMinutes}`);
}

// Standard entry point for competitive programming: read input from stdin.
ContestScoreCalculator(require("fs").readFileSync("/dev/stdin", "utf8"));