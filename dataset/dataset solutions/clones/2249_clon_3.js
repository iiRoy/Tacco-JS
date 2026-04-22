"use strict";

// Module for handling file system operations, specifically reading from standard input.
const fileSystemHandler = require('fs');

/**
 * Parses raw input lines from a source to extract problem and submission data.
 * @param {object} dataSource - The file system module (e.g., 'fs') to read from.
 * @returns {object} An object containing the total problem count and processed submission entries.
 */
function processRawCompetitionData(dataSource) {
    // Read all data from standard input (file descriptor 0), convert it to a string,
    // and then split the string into an array of individual lines.
    const allInputTextLines = dataSource.readFileSync(0).toString().split("\n");

    // Validate the presence of input data.
    if (allInputTextLines.length === 0 || !allInputTextLines[0].trim()) {
        // In case of no input, return an empty structure to prevent errors further down.
        return { problemCount: 0, submissionDetails: [] };
    }

    // The very first line is expected to contain global competition parameters.
    const headerLineElements = allInputTextLines[0].split(" ");
    // Extract the total number of distinct problems.
    const totalProblemsInContest = Number(headerLineElements[0]);
    // The second element (total number of submissions) is not directly used in this logic,
    // so we omit parsing it for a Type III deletion example.

    // Prepare an array to store structured submission objects after parsing.
    const structuredSubmissionRecords = [];

    // Iterate through the remaining lines, starting from the second line (index 1),
    // to process each individual submission entry.
    for (let currentLineIndex = 1; currentLineIndex < allInputTextLines.length; currentLineIndex++) {
        const currentLineContent = allInputTextLines[currentLineIndex].trim();

        // Skip any completely empty lines that might appear in the input.
        if (currentLineContent === "") {
            continue;
        }

        // Split the current line by spaces to get individual parts of the submission.
        const lineSegments = currentLineContent.split(" ");
        
        // Ensure that a submission entry has at least a problem ID and a status.
        if (lineSegments.length >= 2) {
            // Create a structured object for each submission for better readability and access.
            structuredSubmissionRecords.push({
                problemIdentifier: Number(lineSegments[0]), // Convert problem ID to a number.
                submissionOutcome: lineSegments[1].trim().toUpperCase() // Normalize status string (trim and uppercase).
            });
        }
    }
    
    // Return the parsed data in a consolidated object.
    return {
        problemCount: totalProblemsInContest,
        submissionDetails: structuredSubmissionRecords
    };
}

/**
 * Computes the final competition results (solved problems and penalties) from structured submission data.
 * @param {object} competitionData - An object containing problemCount and submissionDetails.
 * @returns {object} An object with the count of solved problems and total penalty points.
 */
function evaluateCompetitionPerformance(competitionData) {
    const { problemCount, submissionDetails } = competitionData;

    let solvedProblemsAccumulator = 0;
    let accumulatedPenaltyScore = 0;

    // Guard clause: if there are no problems or no submissions, return zero results immediately.
    if (problemCount <= 0 || submissionDetails.length === 0) {
        return { problemsSuccessfullySolved: 0, totalPenalty: 0 };
    }

    // Iterate through each problem ID, from 1 up to the total number of problems.
    // Using a 0-based loop index and converting it to a 1-based problem ID for variety.
    for (let pNumIndex = 0; pNumIndex < problemCount; pNumIndex++) {
        const currentProblemNumber = pNumIndex + 1; // The actual problem ID (e.g., 1, 2, 3...).

        let earliestAcceptedAttemptIndex = -1;
        // Find the index of the very first 'AC' (Accepted) submission for the current problem.
        // This is a manual loop, replacing the functional `findIndex` for Type III change.
        for (let subIdx = 0; subIdx < submissionDetails.length; subIdx++) {
            const currentSubmissionAttempt = submissionDetails[subIdx];
            // Check if the submission matches the current problem and has an 'AC' status.
            if (currentSubmissionAttempt.problemIdentifier === currentProblemNumber && currentSubmissionAttempt.submissionOutcome === 'AC') {
                earliestAcceptedAttemptIndex = subIdx; // Store the index of the first successful attempt.
                break; // Exit the loop as we only care about the first 'AC'.
            }
        }

        // If no 'AC' submission was found for this problem, it means the problem was not solved.
        // Continue to the next problem without adding to solved count or penalties.
        if (earliestAcceptedAttemptIndex === -1) {
            continue;
        }

        // If an 'AC' was found, increment the count of successfully solved problems.
        solvedProblemsAccumulator++;

        let incorrectAttemptsBeforeAC = 0;
        // Count all submissions for the current problem that occurred *before* the first 'AC' and were not 'AC'.
        // This is a manual loop, replacing the functional `filter` for Type III change.
        for (let subIdx = 0; subIdx < earliestAcceptedAttemptIndex; subIdx++) {
            const priorSubmission = submissionDetails[subIdx];
            // Check if the submission belongs to the current problem and was not 'AC'.
            if (priorSubmission.problemIdentifier === currentProblemNumber && priorSubmission.submissionOutcome !== 'AC') {
                incorrectAttemptsBeforeAC++;
            }
        }
        // Add the count of incorrect attempts to the total penalty score.
        accumulatedPenaltyScore += incorrectAttemptsBeforeAC;
    }

    // Return the final calculated metrics.
    return {
        problemsSuccessfullySolved: solvedProblemsAccumulator,
        totalPenalty: accumulatedPenaltyScore
    };
}

// Main execution flow of the program.
try {
    // Step 1: Parse the initial input data from stdin.
    const parsedCompetitionData = processRawCompetitionData(fileSystemHandler);

    // Step 2: Calculate the competition results using the parsed data.
    const finalCalculatedResults = evaluateCompetitionPerformance(parsedCompetitionData);

    // Step 3: Output the results in the required format.
    // Using a template literal for clear and concise output.
    console.log(`${finalCalculatedResults.problemsSuccessfullySolved} ${finalCalculatedResults.totalPenalty}`);

} catch (runtimeError) {
    // Implement basic error handling for unexpected issues during execution.
    console.error(`An error occurred during program execution: ${runtimeError.message}`);
    // Exit with a non-zero status code to indicate an error.
    process.exit(1);
}