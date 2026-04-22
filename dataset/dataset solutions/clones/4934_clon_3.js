'use strict';

// Function to handle the processing of contestant eligibility based on given criteria.
const processContestants = (rawDataString) => {
  // Parse the incoming raw data string into individual lines.
  const inputSegments = rawDataString.trim().split('\n');

  // A guard clause to ensure sufficient input is provided.
  if (inputSegments.length < 2) {
    console.error("Input processing error: Expected at least two lines of configuration and participant data.");
    return;
  }

  // Extract and parse the numerical configuration parameters from the first line.
  // These parameters typically represent limits or counts for various participant types.
  const evaluationCriteria = [];
  const rawNumericInputs = inputSegments[0].split(' ');
  for (let k = 0; k < rawNumericInputs.length; k++) {
    evaluationCriteria.push(parseInt(rawNumericInputs[k], 10)); // Use parseInt with radix for robustness.
  }

  // Convert the second line of input into an array of individual participant type characters.
  const contenderSequence = Array.from(inputSegments[1]);

  // An array to store the boolean result (true for pass, false for fail) for each contender.
  const outcomeRegistry = new Array(contenderSequence.length);

  // Calculate the combined upper limit for 'a' and 'b' type passes, as per original logic.
  // This corresponds to a[1] + a[2] in the original code.
  const combinedPassThreshold = evaluationCriteria[1] + evaluationCriteria[2];

  // Iterate through each contender in the sequence to determine their eligibility status.
  for (let currentContenderIndex = 0; currentContenderIndex < contenderSequence.length; currentContenderIndex++) {
    const currentContenderType = contenderSequence[currentContenderIndex]; // Store current type for readability.

    // Logic for 'a' type contenders.
    if (currentContenderType === 'a') {
      // The original logic for 'a' type was based on the sequential index.
      // An 'a' contender passes if their sequential position (1-indexed) is less than the combined threshold.
      const oneBasedContenderPosition = currentContenderIndex + 1;
      if (oneBasedContenderPosition < combinedPassThreshold) {
        outcomeRegistry[currentContenderIndex] = true;
      } else {
        outcomeRegistry[currentContenderIndex] = false;
      }
    }
    // Logic for 'b' type contenders.
    else if (currentContenderType === 'b') {
      // This section replicates the original code's specific (and effectively always failing) logic for 'b' types.
      // The original 'foreigner' variable was re-calculated for each 'b' and then used in a condition that never passed.
      let countOfBTypesPrior = 0; // Local variable to mimic the 'foreigner' behavior for this iteration.

      // Count all 'b' type contenders that appeared before the current one.
      let preceedingIndex = 0;
      while (preceedingIndex < currentContenderIndex) {
        if (contenderSequence[preceedingIndex] === 'b') {
          countOfBTypesPrior++;
        }
        preceedingIndex++;
      }

      // The core condition from the original code: `i + 1 < foreigner`.
      // This condition (current_index + 1 < count_of_b_before_current) will always evaluate to false,
      // as 'count_of_b_before_current' can be at most 'current_index'.
      const currentContenderNumericalOrder = currentContenderIndex + 1;
      if (currentContenderNumericalOrder < countOfBTypesPrior) {
        outcomeRegistry[currentContenderIndex] = true; // This branch is effectively never reached.
      } else {
        outcomeRegistry[currentContenderIndex] = false;
      }
      // The original code had a redundant `foreigner = 0;` here, which is omitted as a Type III deletion
      // of a non-essential statement, since `countOfBTypesPrior` is a local variable.
    }
    // Logic for any other type of contender.
    else {
      // Any participant not of type 'a' or 'b' automatically fails.
      outcomeRegistry[currentContenderIndex] = false;
    }
  }

  // Iterate through the collected eligibility outcomes and print them.
  // Using forEach for a different iteration style compared to the original for loop.
  outcomeRegistry.forEach(isEligible => {
    const resultString = isEligible ? "Yes" : "No"; // Use ternary for conciseness.
    outputFormattedResult(resultString); // Utilize a helper function for output.
  });
};

// A helper utility function to handle console output, ensuring a newline character.
const outputFormattedResult = (messageContent) => {
  process.stdout.write(messageContent + '\n');
};

// Main execution block: reads input and calls the processing function.
try {
  const fileSystemUtility = require("fs"); // Import the file system module.
  const standardInputData = fileSystemUtility.readFileSync("/dev/stdin", "utf8");
  processContestants(standardInputData);
} catch (inputReadError) {
  // Graceful error handling for input reading failures.
  console.error(`An error occurred while attempting to read from standard input: ${inputReadError.message}`);
  // In a production scenario, one might exit or provide default behavior here.
}