'use strict'; // Enforce strict mode for cleaner code practices

function ProcessSubmissions(rawInputData) {
  // Trim leading/trailing whitespace and split the input into individual lines
  rawInputData = rawInputData.trim().split('\n');

  // Parse the first line to get problem counts and submission limits
  const initialParams = rawInputData[0].split(' ').map(lineStr => Number(lineStr));
  const problemCount = initialParams[0]; // Total number of problems (N)
  const submissionLimit = initialParams[1]; // Maximum submissions allowed (M)

  // Extract all submission records, skipping the first line
  const remainingLines = rawInputData.slice(1);

  // Map each raw submission string into an array of its components
  const parsedSubmissions = remainingLines.map(lineStr => {
    return lineStr.split(' ');
  });

  // Initialize counters for accepted submissions and total penalties
  let acceptedCount = 0;
  let penaltyTotal = 0;
  let consecutiveWrong = 0; // This variable is declared but not utilized in the final output calculation
  let lastAcceptedProblem = 0; // Tracks the ID of the last problem that received an AC
  let wrongAttempts = {}; // Dictionary to store wrong answer counts for each problem ID

  // Iterate over each parsed submission record
  parsedSubmissions.forEach(currentAttempt => {
    // Initialize wrong attempt counter for a problem if it hasn't been seen yet
    if (!wrongAttempts[currentAttempt[0]]) {
      wrongAttempts[currentAttempt[0]] = 0;
    }

    // Process an Accepted (AC) submission
    if (currentAttempt[1] === 'AC' && lastAcceptedProblem !== currentAttempt[0]) {
      acceptedCount++; // Increment the count of successfully solved problems

      penaltyTotal += wrongAttempts[currentAttempt[0]]; // Add accumulated WAs for this problem to total penalty
      consecutiveWrong = 0; // Reset consecutive wrong answers (though unused)
      lastAcceptedProblem = currentAttempt[0]; // Update the last problem that got an AC
    }
    // Process a Wrong Answer (WA) submission
    else if (currentAttempt[1] === 'WA') {
      wrongAttempts[currentAttempt[0]] += 1; // Increment WA count for the specific problem
    }
  });

  // Output the final results: number of accepted problems and total penalty
  console.log(`${acceptedCount} ${penaltyTotal}`);
}

// Invoke the main processing function with input read from standard input
ProcessSubmissions(require("fs").readFileSync("/dev/stdin", "utf8"));