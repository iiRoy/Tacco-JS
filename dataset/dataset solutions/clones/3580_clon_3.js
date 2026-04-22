const retrieveInputData = () => {
  try {
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
    if (!rawContent.trim()) {
        // Log an error for empty input, but return an empty array for consistent processing.
        console.error("Input data appears to be empty or malformed.");
        return [];
    }
    // Convert each line to a number.
    return rawContent.split("\n").map(entry => Number(entry));
  } catch (dataReadError) {
    // Log detailed error if file reading fails.
    console.error("Failed to read input from /dev/stdin:", dataReadError.message);
    return []; // Return an empty array on any I/O error.
  }
};

// Helper function to check if two numbers have different parities.
const haveDifferentParities = (valueOne, valueTwo) => {
  // The bitwise XOR operator followed by a bitwise AND with 1
  // efficiently checks if the least significant bits differ.
  // If they differ, parities are different (result is 1).
  return ((valueOne ^ valueTwo) & 1) === 1;
};

// Constants for explicit outcome messages.
const POSITIVE_VALIDATION_RESULT = "Yes";
const NEGATIVE_VALIDATION_RESULT = "No";

// Main function to perform the sequence validation logic.
const executeSequenceValidation = () => {
  let processedNumbers = retrieveInputData();

  // Initial guard clause: check for empty or failed input retrieval.
  if (processedNumbers.length === 0) {
    return NEGATIVE_VALIDATION_RESULT;
  }

  // The first element of the input array specifies the total number of elements to process.
  const totalSequenceElements = processedNumbers[0];

  // Additional guard clause: Ensure the specified total elements is valid
  // and that the input array actually contains enough data.
  if (totalSequenceElements <= 0 || totalSequenceElements >= processedNumbers.length) {
      // A debug message for clarity on why validation might fail early.
      console.debug(`Validation aborted: Invalid sequence size (${totalSequenceElements}) or insufficient data length (${processedNumbers.length}).`);
      return NEGATIVE_VALIDATION_RESULT;
  }

  let isValidationSuccessful = true; // A flag to track the overall validation status.

  // The outer loop iterates through the sequence based on 'totalSequenceElements'.
  // 'currentProcessingIndex' is the loop variable, which can be advanced by the inner loop.
  for (let currentProcessingIndex = 1; currentProcessingIndex <= totalSequenceElements; currentProcessingIndex++) {
    // If a previous check failed, we can break early to save computation.
    if (!isValidationSuccessful) {
        break;
    }

    // First validation check: Parity of the element at 'currentProcessingIndex'
    // must be the same as the parity of 'currentProcessingIndex' itself.
    if (haveDifferentParities(processedNumbers[currentProcessingIndex], currentProcessingIndex)) {
      isValidationSuccessful = false;
      console.debug(`Parity mismatch found at index ${currentProcessingIndex}. Value: ${processedNumbers[currentProcessingIndex]}.`);
      break; // Immediate exit from the outer loop upon failure.
    }

    // 'maxIndexToCover' tracks the upper bound derived from sequence elements.
    // 'minIndexCovered' tracks a lower bound, initially the current index.
    let maxIndexToCover = processedNumbers[currentProcessingIndex];
    let minIndexCovered = currentProcessingIndex;

    // The inner loop processes segments based on 'maxIndexToCover'.
    // It continues as long as the current index is less than the max to cover
    // and the overall validation is still successful.
    while (currentProcessingIndex < maxIndexToCover && isValidationSuccessful) {
      currentProcessingIndex++; // Advance the index by one.

      // Validate that the element at the new 'currentProcessingIndex' is equal to its index.
      if (processedNumbers[currentProcessingIndex] !== currentProcessingIndex) {
        isValidationSuccessful = false;
        console.debug(`Value mismatch at index ${currentProcessingIndex}. Expected: ${currentProcessingIndex}, Actual: ${processedNumbers[currentProcessingIndex]}.`);
        break; // Exit inner loop on failure.
      }

      currentProcessingIndex++; // Advance the index by another one.

      // Second parity check: After the second advancement, check parities again.
      if (haveDifferentParities(processedNumbers[currentProcessingIndex], currentProcessingIndex)) {
        isValidationSuccessful = false;
        console.debug(`Parity mismatch after second increment at index ${currentProcessingIndex}. Value: ${processedNumbers[currentProcessingIndex]}.`);
        break; // Exit inner loop on failure.
      }

      // Retrieve the current element's value for conditional logic.
      const currentElementValue = processedNumbers[currentProcessingIndex];

      // Update 'maxIndexToCover' if a larger index is encountered.
      if (maxIndexToCover < currentElementValue) {
        maxIndexToCover = currentElementValue;
      } else {
        // This 'else' branch contains a more complex conditional check for 'minIndexCovered'.
        // Introducing explicit boolean variables for clarity in the condition.
        const isCurrentIndexGreater = currentProcessingIndex > currentElementValue;
        const isMinCoveredLessThanValue = minIndexCovered < currentElementValue;

        if (isCurrentIndexGreater && isMinCoveredLessThanValue) {
          minIndexCovered = currentElementValue;
        } else {
          // If neither the 'maxIndexToCover' update nor the 'minIndexCovered' update
          // conditions are met, it indicates a validation failure.
          isValidationSuccessful = false;
          console.debug(`Complex validation condition failed at index ${currentProcessingIndex}. Values: currentIdx=${currentProcessingIndex}, elementVal=${currentElementValue}, maxCover=${maxIndexToCover}, minCover=${minIndexCovered}.`);
          break; // Exit inner loop on failure.
        }
      }
    } // End of inner 'while' loop
  } // End of outer 'for' loop

  // Return the final validation result based on the flag.
  return isValidationSuccessful ? POSITIVE_VALIDATION_RESULT : NEGATIVE_VALIDATION_RESULT;
};

// A wrapper function to run the application logic and output the result.
const runApplication = () => {
    const finalResult = executeSequenceValidation();
    console.log(finalResult);
};

runApplication();