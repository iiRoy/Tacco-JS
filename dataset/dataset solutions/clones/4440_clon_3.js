const analyzeNumberSequence = (sourceText) => {
  // Input sanitation: Remove newlines, trim leading/trailing whitespace, and split into an array of strings.
  // Using a regular expression `/\s+/` ensures splitting by one or more whitespace characters,
  // making it robust against multiple spaces between numbers.
  let processedSegments = sourceText.trim().split(/\s+/);

  // Extract the total count of numbers expected in the sequence from the beginning of the array.
  // The `shift()` method removes the first element and returns it.
  // `parseInt` with radix 10 ensures explicit conversion to an integer.
  const countOfElementsToProcess = parseInt(processedSegments.shift(), 10);

  // Guard clause: Validate that the extracted count is a non-negative number.
  // If invalid, log an error and exit the function gracefully.
  if (isNaN(countOfElementsToProcess) || countOfElementsToProcess < 0) {
    console.error("Input processing error: Invalid or missing sequence length.");
    return;
  }

  // Initialize distinct counters for numbers based on their divisibility properties.
  // `multipleOfFourCount`: Stores the tally of numbers perfectly divisible by 4.
  // `evenButNotFourCount`: Stores the tally of numbers divisible by 2 but NOT by 4.
  // `oddNumberCount`: Stores the tally of numbers that are not divisible by 2 (i.e., odd).
  let multipleOfFourCount = 0;
  let evenButNotFourCount = 0;
  let oddNumberCount = 0;

  // Iterate through the remaining segments, up to the specified `countOfElementsToProcess`.
  // `currentIterationIndex` serves as the loop counter.
  for (let currentIterationIndex = 0; currentIterationIndex < countOfElementsToProcess; ++currentIterationIndex) {
    // Attempt to convert the current string segment into an integer.
    const numericValue = parseInt(processedSegments[currentIterationIndex], 10);

    // Validation check: Ensure the parsed value is a valid number.
    // If not a number, skip this segment and proceed to the next, preventing errors.
    if (isNaN(numericValue)) {
        // Optionally, one could log a warning here for malformed input.
        continue;
    }

    // Apply divisibility rules to categorize and count the `numericValue`.
    // The order of checks is important: check for divisibility by 4 first,
    // as numbers divisible by 4 are also divisible by 2.
    if ((numericValue % 4) === 0) {
      multipleOfFourCount++;
    } else if ((numericValue % 2) === 0) { // If not divisible by 4, check if it's even.
      evenButNotFourCount++;
    } else { // If neither of the above, it must be an odd number.
      oddNumberCount++;
    }
  }

  // Evaluate the final condition to determine the output message.
  // A boolean flag `isSuccessConditionMet` is used for intermediate clarity.
  let isSuccessConditionMet = false;

  // First condition for a "Yes" verdict: The count of odd numbers is less than or equal to
  // the count of numbers divisible by four.
  if (oddNumberCount <= multipleOfFourCount) {
    isSuccessConditionMet = true;
  }
  // Second condition for a "Yes" verdict (checked only if the first is false):
  // The count of odd numbers is exactly one more than the count of numbers divisible by four,
  // AND there are no numbers that are even but not divisible by four.
  else if (oddNumberCount === multipleOfFourCount + 1 && evenButNotFourCount === 0) {
    isSuccessConditionMet = true;
  }
  // If neither of the above conditions are met, `isSuccessConditionMet` remains `false`.

  // Construct the final output string based on the evaluation.
  const evaluationResultText = isSuccessConditionMet ? "Yes" : "No";

  // Display the final result to the standard output.
  console.log(evaluationResultText);
};

// Entry point for the script: Read the entire content of standard input as a UTF-8 string,
// then pass it to the `analyzeNumberSequence` function for processing.
analyzeNumberSequence(require("fs").readFileSync("/dev/stdin", "utf8"));