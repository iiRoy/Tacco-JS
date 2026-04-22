"use strict";

// This module processes contest submission logs to tally accepted solutions and wrong attempts.
function AnalyzeSubmissionData(submissionLog) {
  // Split the entire log into individual records based on newline characters.
  let submissionRecords = submissionLog.split('\n');

  // The first line contains metadata: problem count and number of entries.
  // Extract the expected number of data entries from the first line.
  // Use parseInt with radix 10 for robustness.
  const expectedEntriesCount = parseInt(submissionRecords.shift().split(' ')[1], 10);

  // A registry to store all attempts for each unique problem identifier.
  // Key: problem identifier (string), Value: an array of attempt outcomes (e.g., ['WA', 'AC', 'WA'])
  const challengeAttemptRegister = new Map();

  // Iterate through the submission records to populate the attempt registry.
  // We use expectedEntriesCount to ensure we process only the relevant data lines.
  for (let idx = 0; idx < expectedEntriesCount; ++idx) {
    const currentEntryParts = submissionRecords[idx].split(' ');
    const challengeIdentifier = currentEntryParts[0];
    const attemptOutcome = currentEntryParts[1];

    // If this is the first attempt recorded for this challenge, initialize its array.
    if (!challengeAttemptRegister.has(challengeIdentifier)) {
      challengeAttemptRegister.set(challengeIdentifier, []);
    }
    // Append the current attempt outcome to the problem's history.
    challengeAttemptRegister.get(challengeIdentifier).push(attemptOutcome);
  }

  // Variables to accumulate the final counts.
  let totalAcceptedSubmissions = 0;
  let totalIncorrectAttempts = 0;

  // Process each challenge's attempt history to determine final scores.
  // Iterate over the entries in the challenge attempt registry using Map.entries().
  for (const [currentProblemId, attemptSequence] of challengeAttemptRegister.entries()) {
    // Flag to track if 'AC' was achieved for the current problem.
    // This helps in counting 'WA's only if they occur before an 'AC'.
    let problemSolvedSuccessfully = false;
    
    // Iterate through the sequence of attempts for the current problem.
    for (let k = 0; k < attemptSequence.length; ++k) {
      const currentAttemptStatus = attemptSequence[k];

      if (currentAttemptStatus === 'AC') {
        totalAcceptedSubmissions++;
        problemSolvedSuccessfully = true; // Mark that this problem was solved.
        break; // Once 'AC' is found, no further attempts for this problem matter for WA counting.
      } else if (currentAttemptStatus === 'WA') {
        // Only count 'WA' if an 'AC' hasn't been found yet for this problem.
        // If an 'AC' is never found for a problem, all its 'WA's will be counted.
        totalIncorrectAttempts++;
      }
      // Optional: Add a guard clause for unexpected attempt statuses.
      // For this specific problem, we'll simply ignore unknown statuses.
      else {
          // console.warn(`[Validation Warning] Unexpected attempt status encountered for problem ${currentProblemId}: '${currentAttemptStatus}'. Skipping.`);
      }
    }
    
    // Another optional fragment: Log if a problem had no valid attempts.
    // This check is mostly for demonstrating the addition of new code fragments.
    if (attemptSequence.length === 0) {
        // console.debug(`Problem ${currentProblemId} had no recorded attempts.`);
    }
  }

  // Output the final tally of accepted solutions and incorrect attempts.
  // Using a template literal for output for a slight variation in string formatting.
  console.log(`${totalAcceptedSubmissions} ${totalIncorrectAttempts}`);
}

// Entry point for execution. Reads input from standard input using Node.js 'fs' module.
const fileSystemModule = require("fs");
const inputDataPath = "/dev/stdin";
const encodingFormat = "utf8";

// Execute the main analysis function with the provided input data.
AnalyzeSubmissionData(fileSystemModule.readFileSync(inputDataPath, encodingFormat));