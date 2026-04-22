'use strict';

// This module provides a function to analyze programming contest submission data.
// It calculates the number of problems correctly solved and the total penalty attempts
// for problems that were not yet accepted.
const processSubmissionData = (rawDataLines) => {
  // Defensive check: Ensure input data is available.
  if (!Array.isArray(rawDataLines) || rawDataLines.length === 0) {
    console.error("Error: No raw data lines provided for processing.");
    return; // Exit if no data to process.
  }

  // Parse the first line of input to determine the contest parameters.
  // This line is expected to contain two space-separated integers:
  // the total number of distinct problems (P) and the total number of submissions (S).
  const contestDimensions = rawDataLines[0].split(' ');
  const totalProblemCount = parseInt(contestDimensions[0], 10);
  const totalSubmissionCount = parseInt(contestDimensions[1], 10);

  // Validate the parsed problem and submission counts.
  // Ensure they are valid non-negative integers.
  if (isNaN(totalProblemCount) || isNaN(totalSubmissionCount) || totalProblemCount < 0 || totalSubmissionCount < 0) {
    console.error(`Error: Invalid problem count (${contestDimensions[0]}) or submission count (${contestDimensions[1]}).`);
    return;
  }

  // Initialize a tracking array for problem acceptance status.
  // Each element corresponds to a problem (0-indexed).
  // 'false' means the problem is not yet accepted, 'true' means it has been accepted.
  const problemAcceptanceStatus = new Array(totalProblemCount).fill(false);

  // Initialize counters for the final results.
  let successfulAcceptances = 0; // Counts unique problems solved.
  let accumulatedPenalties = 0; // Counts 'WA' for problems not yet solved.

  // Iterate through each submission record provided in the input.
  // Submission records start from the second line (index 1) of the raw data.
  for (let submissionIndex = 0; submissionIndex < totalSubmissionCount; ++submissionIndex) {
    const currentSubmissionEntry = rawDataLines[submissionIndex + 1];

    // Skip processing if the submission entry is empty or undefined.
    if (!currentSubmissionEntry) {
        // This might indicate incomplete input for the specified totalSubmissionCount.
        continue;
    }

    // Each submission entry consists of a problem ID and its status (e.g., "1 WA").
    const entryTokens = currentSubmissionEntry.split(' ');

    // Basic validation for the format of a submission entry.
    if (entryTokens.length < 2) {
      console.warn(`Warning: Malformed submission entry encountered: '${currentSubmissionEntry}'. Skipping.`);
      continue;
    }

    // Extract and convert the problem ID to a 0-indexed value for array access.
    const problemId = parseInt(entryTokens[0], 10) - 1;
    // Extract the submission outcome string.
    const outcomeStatus = entryTokens[1];

    // Validate the problem ID to ensure it falls within the expected range.
    if (isNaN(problemId) || problemId < 0 || problemId >= totalProblemCount) {
      console.warn(`Warning: Submission for invalid problem ID '${entryTokens[0]}' (index ${problemId}) detected. Skipping.`);
      continue;
    }

    // Process the submission only if the problem has not been accepted previously.
    if (!problemAcceptanceStatus[problemId]) {
      // Use a switch statement to handle different submission outcomes.
      switch (outcomeStatus) {
        case 'AC': // 'Accepted' status.
          successfulAcceptances++; // Increment the count of successfully solved problems.
          problemAcceptanceStatus[problemId] = true; // Mark this problem as solved.
          break;
        case 'WA': // 'Wrong Answer' status.
          accumulatedPenalties++; // Increment the penalty count.
          break;
        // Other statuses (e.g., TLE, MLE, RE) are implicitly ignored as per problem logic.
        default:
          // Optional: Log or handle unexpected submission statuses if needed.
          // console.log(`Info: Unrecognized submission status '${outcomeStatus}' for problem ${problemId + 1}. Ignoring.`);
          break;
      }
    }
  }

  // Output the final calculated results: accepted problems and total penalties.
  // The format is "successfulAcceptances accumulatedPenalties".
  console.log(`${successfulAcceptances} ${accumulatedPenalties}`);
};

// Helper function to read input from standard input in a typical competitive programming setup.
const readStandardInput = () => {
  try {
    // Reads the entire content of '/dev/stdin', decodes it as UTF-8,
    // and then splits it into an array of lines.
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    return fileContent.split('\n');
  } catch (e) {
    // Log an error if reading from stdin fails, which might happen in non-standard environments.
    console.error("Failed to read input from /dev/stdin:", e.message);
    return []; // Return an empty array to prevent further errors.
  }
};

// Invoke the main processing function with data obtained from standard input.
processSubmissionData(readStandardInput());