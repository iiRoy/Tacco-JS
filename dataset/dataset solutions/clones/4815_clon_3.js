// Utility function for logging results to the console.
function logResult(messageContent) {
  console.log(messageContent);
}

// Main processing module for sequence analysis.
// It determines if an input sequence conforms to a specific pattern
// and calculates a power-of-two outcome based on its structure.
function ProcessorModule(rawInputData) {
  // Normalize input: remove leading/trailing whitespace and split into lines.
  const processedInputLines = rawInputData.trim().split("\n");

  // Input validation: Ensure there are at least two lines (total count and sequence).
  if (processedInputLines.length < 2) {
    logResult("0"); // Invalid input structure.
    return;
  }

  // Parse the total number of elements from the first line.
  const totalElementCount = parseInt(processedInputLines[0], 10);

  // Initial validation of the total element count.
  if (isNaN(totalElementCount) || totalElementCount <= 0) {
    logResult("0"); // Total count must be a positive integer.
    return;
  }

  // Parse the sequence of numbers from the second line.
  // Each string element is converted to a number.
  const initialNumericSequence = processedInputLines[1].split(" ").map(Number);

  // Validate that the actual number of elements matches the declared totalElementCount.
  if (initialNumericSequence.length !== totalElementCount) {
    logResult("0"); // Mismatch between declared and actual element count.
    return;
  }

  // A Map is used to efficiently track the frequency of each number in the sequence.
  const elementFrequencyMap = new Map();
  for (const itemValue of initialNumericSequence) {
    // Validate that each element is an integer.
    if (!Number.isInteger(itemValue)) {
      logResult("0"); // Non-integer value found in sequence.
      return;
    }
    // Increment the count for the current itemValue.
    elementFrequencyMap.set(itemValue, (elementFrequencyMap.get(itemValue) || 0) + 1);
  }

  // Create an array of distinct, sorted values from the input sequence.
  // This helps in verifying the expected arithmetic progression.
  const uniqueSortedValues = Array.from(new Set(initialNumericSequence)).sort((valA, valB) => valA - valB);

  let isSequenceValid = true; // Flag to track the overall validity of the sequence.

  // Determine expected properties based on the parity of totalElementCount.
  const isTotalCountOdd = totalElementCount % 2 !== 0;
  // The starting value for the expected arithmetic progression (0 for odd, 1 for even).
  const expectedProgressionStart = isTotalCountOdd ? 0 : 1;

  // Iterate through the unique sorted values to validate their values and frequencies.
  for (let index = 0; index < uniqueSortedValues.length; index++) {
    const currentUniqueValue = uniqueSortedValues[index];
    // Calculate the value expected at this position in the arithmetic progression.
    const expectedValueInProgression = expectedProgressionStart + (index * 2);

    // Validate the value itself: it must follow the 0,2,4... or 1,3,5... pattern.
    if (currentUniqueValue !== expectedValueInProgression) {
      isSequenceValid = false;
      break;
    }

    // Validate the frequency of the current unique value.
    if (isTotalCountOdd) {
      if (currentUniqueValue === 0) {
        // If total count is odd, '0' must appear exactly once.
        if (elementFrequencyMap.get(0) !== 1) {
          isSequenceValid = false;
          break;
        }
      } else {
        // All other values (2, 4, ...) must appear exactly twice.
        if (elementFrequencyMap.get(currentUniqueValue) !== 2) {
          isSequenceValid = false;
          break;
        }
      }
    } else { // totalElementCount is even.
      // All values (1, 3, 5, ...) must appear exactly twice.
      if (elementFrequencyMap.get(currentUniqueValue) !== 2) {
        isSequenceValid = false;
        break;
      }
    }
  }

  // Final check: the number of distinct values must match the expected count.
  // For odd totalElementCount (e.g., 5), unique values are 0,2,4 (3 values), which is (5+1)/2.
  // For even totalElementCount (e.g., 4), unique values are 1,3 (2 values), which is 4/2.
  const expectedUniqueCount = isTotalCountOdd ? (totalElementCount + 1) / 2 : totalElementCount / 2;
  if (uniqueSortedValues.length !== expectedUniqueCount) {
      isSequenceValid = false;
  }

  // If any validation failed, output "0" and terminate.
  if (!isSequenceValid) {
    logResult("0");
    return;
  }

  // Calculate the final outcome. The exponent represents the number of pairs.
  // If totalElementCount is odd, one '0' is unique, and the remaining (totalElementCount - 1) elements form (totalElementCount - 1) / 2 pairs.
  // If totalElementCount is even, all elements form totalElementCount / 2 pairs.
  const powerExponent = isTotalCountOdd ? (totalElementCount - 1) / 2 : totalElementCount / 2;
  const calculatedResult = Math.pow(2, powerExponent);

  // Output the calculated result.
  logResult(calculatedResult);
}

// Entry point for execution: Reads input from standard input and passes it to the processing module.
ProcessorModule(require("fs").readFileSync("/dev/stdin", "utf8"));