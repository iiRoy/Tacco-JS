'use strict';

// This function processes the raw input data to calculate correct answers and penalties.
const processInput = (rawData) => {
  // Parse the first line to get the number of problems (N) and submissions (M).
  const dimensions = rawData[0].split(' ').map(item => parseInt(item, 10));
  const numProblems = dimensions[0];
  const numSubmissions = dimensions[1];

  // Initialize an array to store submission records.
  // Each element will be an array representing a submission: [problem_index, status_string].
  let submissionRecords = new Array(numSubmissions);
  // Initialize an array to track the status of each problem (0: not yet AC, 1: AC).
  let problemStatus = new Array(numProblems);
  // Counters for penalties (wrong answers before AC) and correct answers.
  let penaltyCount = 0;
  let correctCount = 0;

  // Initialize all problem statuses to 0 (not yet accepted).
  for (let k = 0; k < numProblems; k++) {
    problemStatus[k] = 0;
  }

  // Iterate through each submission record.
  for (let k = 0; k < numSubmissions; k++) {
    // Parse the submission details from the input.
    submissionRecords[k] = rawData[k + 1].split(' ');
    // Convert problem number to 0-indexed.
    submissionRecords[k][0] = parseInt(submissionRecords[k][0], 10) - 1;

    // Check if this problem has not yet been accepted.
    if (problemStatus[submissionRecords[k][0]] === 0) {
      // If it's a Wrong Answer (WA), increment penalty count.
      if (submissionRecords[k][1] === 'WA') {
        penaltyCount++;
      }
      // If it's an Accepted (AC) answer, increment correct count and mark the problem as accepted.
      if (submissionRecords[k][1] === 'AC') {
        correctCount++;
        problemStatus[submissionRecords[k][0]] = 1; // Mark as accepted
      }
    }
  }

  // Output the total number of correct answers and penalties.
  console.log(correctCount, penaltyCount);
};

// Read input from standard input, decode as UTF-8, split by newlines, and pass to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
