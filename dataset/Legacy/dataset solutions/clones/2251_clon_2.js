'use strict'; // Enforce strict mode for cleaner code execution.

/**
 * Processes contest submission data to calculate the number of accepted problems
 * and the total penalty points incurred.
 * @param {string} rawData - The raw input string, typically read from standard input.
 */
function ProcessInput(rawData) {
  // Normalize the input: remove any leading/trailing whitespace and split into an array of lines.
  const processedData = rawData.trim().split('\n');

  // The first line contains global parameters: N (total problems) and M (total submissions).
  // Split this line by space and convert parts to integers, specifying base 10 for safety.
  const initialParams = processedData[0].split(' ').map(lineSegment => parseInt(lineSegment, 10));
  const problemCount = initialParams[0]; // Represents the total number of distinct problems.
  const submissionCount = initialParams[1]; // Represents the total number of submission attempts.

  // Extract all subsequent lines, which detail individual submission events.
  const remainingSubmissions = processedData.slice(1);

  // Transform each submission line into an array, splitting by space to separate problem ID and status.
  const submissionRecords = remainingSubmissions.map(singleLine => {
    return singleLine.split(' ');
  });

  // Initialize variables to track the contest results.
  let acceptedProblems = 0; // Counter for problems that have been successfully solved.
  let penaltyPoints = 0; // Accumulator for the total penalty score.
  let wrongAttempts = 0; // This variable is declared but its value is always reset and not used in calculations.
  let lastAcceptedProblemId = 0; // Stores the ID of the problem most recently marked as 'AC' to prevent re-counting.
  let wrongAttemptTracker = {}; // An object to store the count of 'Wrong Answer' (WA) submissions for each problem ID.

  // Iterate through each submission record to update scores and states.
  submissionRecords.forEach(currentRecord => {
    // Ensure that an entry exists for the current problem ID in the wrong attempt tracker.
    // If it doesn't exist, initialize it to zero.
    if (!wrongAttemptTracker[currentRecord[0]]) {
      wrongAttemptTracker[currentRecord[0]] = 0;
    }

    // Check if the current submission's status is 'AC' (Accepted).
    // Also, verify that this specific problem ID has not been previously accepted (to avoid double counting).
    if (currentRecord[1] === 'AC' && lastAcceptedProblemId !== currentRecord[0]) {
      acceptedProblems++; // Increment the count of successfully solved problems.

      // Add the accumulated wrong attempts for this problem to the total penalty points.
      penaltyPoints += wrongAttemptTracker[currentRecord[0]];
      wrongAttempts = 0; // Reset the unused wrongAttempts counter.
      lastAcceptedProblemId = currentRecord[0]; // Update the last accepted problem ID to the current one.
    } else if (currentRecord[1] === 'WA') {
      // If the submission status is 'WA' (Wrong Answer).
      wrongAttemptTracker[currentRecord[0]] += 1; // Increment the wrong attempt count for this specific problem.
    }
  });

  // Output the final calculated number of accepted problems and total penalty points.
  console.log(`${acceptedProblems} ${penaltyPoints}`);
}

// Read the entire content from standard input (typically a file in competitive programming environments)
// using Node.js's file system module, and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
