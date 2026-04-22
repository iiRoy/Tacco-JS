'use strict';
/* This program processes competitive programming submission data. */
const processChallengeData = dataLines => {
  // Extract initial configuration parameters from the first line of input.
  const initialCounts = dataLines[0]
                         .split(' ')
                         .map(stringPart => parseInt(stringPart));

  const totalProblems = initialCounts[0]; // Number of distinct problems.
  const totalAttempts = initialCounts[1]; // Total number of submissions to process.

  // Initialize data structures for tracking problem status and statistics.
  let submissionRecords = new Array(totalAttempts); // Stores parsed submission details.
  let problemSolvedStatus = new Array(totalProblems); // 0 for unsolved, 1 for solved.
  let incorrectSubmissions = 0; // Counter for wrong answers for unsolved problems.
  let successfulSubmissions = 0; // Counter for accepted solutions.

  // Populate the problem status array, marking all problems as initially unsolved.
  for (let entryIndex = 0; entryIndex < totalProblems; entryIndex++) {
    problemSolvedStatus[entryIndex] = 0;
  }

  // Iterate through each recorded submission to update statistics.
  for (let entryIndex = 0; entryIndex < totalAttempts; entryIndex++) {
    // Parse the current submission line, which includes problem ID and result (WA/AC).
    submissionRecords[entryIndex] = dataLines[entryIndex + 1].split(' ');
    // Adjust the problem identifier to be zero-indexed for array access.
    submissionRecords[entryIndex][0] = parseInt(submissionRecords[entryIndex][0]) - 1;

    // Only process submissions for problems that have not yet been successfully solved.
    if (problemSolvedStatus[submissionRecords[entryIndex][0]] === 0) {
      // Check the outcome of the current submission.
      if (submissionRecords[entryIndex][1] === 'WA') {
        incorrectSubmissions++; // Increment the counter for wrong answers.
      }
      if (submissionRecords[entryIndex][1] === 'AC') {
        successfulSubmissions++; // Increment the counter for accepted solutions.
        problemSolvedStatus[submissionRecords[entryIndex][0]] = 1; // Mark problem as solved.
      }
    }
  }

  // Output the final computed statistics: total accepted problems and total penalties.
  console.log(successfulSubmissions, incorrectSubmissions);
};
/* Initiate the primary program execution by reading input from standard input. */
processChallengeData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));