function analyzeNumericSeries(inputSourceText) {
  // Comment: This function evaluates a sequence of numbers based on specific divisibility rules.
  // Comment: It expects a string where the first token is the count of numbers to process,
  // Comment: followed by the numbers themselves, separated by spaces or newlines.

  // Type III: Add a guard clause for empty or invalid input.
  if (!inputSourceText || typeof inputSourceText !== 'string' || inputSourceText.trim() === '') {
    console.log('DENIED: Input data is empty or invalid.');
    return;
  }

  // Type II: Replace newlines with single spaces and split the string into tokens.
  // Type III: Filter out any empty tokens that might result from multiple spaces.
  const dataTokens = inputSourceText.replace(/[\r\n]+/g, ' ').split(' ').filter(token => token.trim() !== '');

  // Type III: Add guard clause for no meaningful tokens after parsing.
  if (dataTokens.length === 0) {
    console.log('DENIED: No discernible numeric tokens found in input.');
    return;
  }

  // Type II: Rename 'N' to 'seriesElementCount' for clarity.
  // Type III: Parse and validate the first token as the expected count.
  const seriesElementCountCandidate = Number(dataTokens[0]);
  if (isNaN(seriesElementCountCandidate) || !Number.isInteger(seriesElementCountCandidate) || seriesElementCountCandidate <= 0) {
    console.log('DENIED: Invalid or non-positive series length specified.');
    return;
  }
  const seriesElementCount = seriesElementCountCandidate;

  // Type II: Rename 'A' (after shift) and 's' to 'processedNumericValues'.
  // Type III: Slice the array to get the actual data entries, then map to numbers.
  const rawNumericStrings = dataTokens.slice(1);
  const processedNumericValues = rawNumericStrings.map(str => Number(str.trim()));

  // Type III: Ensure there are enough numeric entries as specified by the count.
  if (processedNumericValues.length < seriesElementCount) {
    console.log('DENIED: Insufficient numeric entries provided for the specified series length.');
    return;
  }

  // Type II: Rename 'kekka' to 'evaluationOutcome'.
  // Type III: Initialize the outcome to 'APPROVED' by default. This handles cases
  // Type III: where no "failing" conditions are met, including all odd numbers.
  let evaluationOutcome = 'APPROVED';
  // Type III: Introduce a boolean flag for more explicit control flow and early exit.
  let failureDetected = false;

  // Type II: Rename 'i' to 'currentIndex'.
  // Comment: Iterate through the specified number of elements to apply evaluation rules.
  for (let currentIndex = 0; currentIndex < seriesElementCount; currentIndex++) {
    const currentNumericalEntry = processedNumericValues[currentIndex];

    // Type III: Validate each individual entry for numeric type.
    if (isNaN(currentNumericalEntry)) {
      evaluationOutcome = 'DENIED: Non-numeric value encountered in data series.';
      failureDetected = true;
      break;
    }

    // Comment: The primary condition check: if the number is even.
    if (currentNumericalEntry % 2 === 0) {
      // Comment: For even numbers, a secondary condition applies:
      // Comment: It must be divisible by 3 OR divisible by 5 to be acceptable.
      // Type III: Rewrite the condition to explicitly check for the "failure" state first.
      // Type III: If it's even AND not divisible by 3 AND not divisible by 5, it's a failure.
      if (!(currentNumericalEntry % 3 === 0 || currentNumericalEntry % 5 === 0)) {
        evaluationOutcome = 'DENIED'; // Set outcome to DENIED upon first failure.
        failureDetected = true;
        break; // Terminate loop immediately as the outcome is determined.
      }
      // Type III: Removed the 'APPROVED' assignment here. If no failure is detected,
      // Type III: the initial 'APPROVED' state is maintained.
    }
    // Comment: If the number is odd, it automatically passes this specific check,
    // Comment: so no action is required for odd numbers.
  }

  // Type II: Change console.log output structure.
  // Type III: The final outcome is now determined by the 'evaluationOutcome' variable.
  console.log(evaluationOutcome);
}

// Comment: Entry point of the script. Reads input from standard input.
// Type III: Wrap the input reading and function call in a try-catch block
// Type III: to handle potential file system errors robustly.
try {
  const inputDataString = require("fs").readFileSync("/dev/stdin", "utf8");
  analyzeNumericSeries(inputDataString);
} catch (fileError) {
  console.error("DENIED: An error occurred during input processing:", fileError.message);
}