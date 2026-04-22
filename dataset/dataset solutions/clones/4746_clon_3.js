const acquireInputData = () => {
  // This function is responsible for fetching raw input from the standard input stream.
  // It reads the entire content as a UTF-8 string and then removes any leading or
  // trailing whitespace characters before returning it.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
};

const printOutputResult = (dataPayload) => {
  // A simple utility function to send the final processed data to standard output.
  // It uses console.log, which typically flushes to stdout.
  console.log(dataPayload);
};

// An enumeration defining various ways raw string input can be transformed.
// Using Object.freeze ensures that these transformation modes cannot be accidentally altered.
const DataProcessingModes = Object.freeze({
  RAW_STRING: 0,                           // Return the input string as is.
  TO_INTEGER_BASE_10: 1,                   // Convert the string to a base-10 integer.
  SPLIT_BY_WHITESPACE: 2,                  // Split the string by space characters.
  SPLIT_BY_NEWLINE_CHAR: 3,                // Split the string by newline characters.
  SPLIT_SPACE_AND_NUMERICALIZE: 4,         // Split by space, then convert each part to a number.
  SPLIT_NEWLINE_AND_NUMERICALIZE: 5,       // Split by newline, then convert each part to a number.
  SPLIT_INTO_INDIVIDUAL_CHARS: 6,          // Break the string into an array of single characters.
  SPLIT_CHARS_AND_NUMERICALIZE: 7,         // Break into characters, then convert each to a number.
});

const transformInputUtility = (sourceValue, transformationKey) => {
  // This function acts as a flexible dispatcher for various input transformations.
  // It takes a source value (typically a string) and a key indicating the desired transformation.
  const inputAsText = String(sourceValue); // Ensure input is string for consistent splitting.

  switch (transformationKey) {
    case DataProcessingModes.RAW_STRING:
      return inputAsText;
    case DataProcessingModes.TO_INTEGER_BASE_10:
      return Number.parseInt(inputAsText, 10);
    case DataProcessingModes.SPLIT_BY_WHITESPACE:
      return inputAsText.split(" ");
    case DataProcessingModes.SPLIT_BY_NEWLINE_CHAR:
      return inputAsText.split("\n");
    case DataProcessingModes.SPLIT_SPACE_AND_NUMERICALIZE:
      return inputAsText.split(" ").map(entry => Number(entry));
    case DataProcessingModes.SPLIT_NEWLINE_AND_NUMERICALIZE:
      return inputAsText.split("\n").map(entry => Number(entry));
    case DataProcessingModes.SPLIT_INTO_INDIVIDUAL_CHARS:
      return inputAsText.split("");
    case DataProcessingModes.SPLIT_CHARS_AND_NUMERICALIZE:
      return inputAsText.split("").map(entry => Number(entry));
    default:
      // If an unrecognized transformation key is provided, log a warning and return the original value.
      console.warn(`[WARNING] Unrecognized transformation key '${transformationKey}'. Returning original input.`);
      return sourceValue;
  }
};

const executeCoreLogic = (fullInputString) => {
  // The main processing flow for the problem.
  // Step 1: Divide the complete input string into an array of lines.
  const processedInputLines = transformInputUtility(fullInputString, DataProcessingModes.SPLIT_BY_NEWLINE_CHAR);

  // Step 2: Extract the number of elements (N) from the first line and convert it to an integer.
  const totalElementsDeclared = transformInputUtility(processedInputLines[0], DataProcessingModes.TO_INTEGER_BASE_10);

  // Step 3: Parse the second line, splitting it by spaces and converting each part to a number.
  const numericalSequence = transformInputUtility(processedInputLines[1], DataProcessingModes.SPLIT_SPACE_AND_NUMERICALIZE);

  // Validation: Check if the number of elements declared matches the actual parsed count.
  if (numericalSequence.length !== totalElementsDeclared) {
    console.error(`[ERROR] Input inconsistency: Declared element count (${totalElementsDeclared}) does not match actual count (${numericalSequence.length}).`);
    // Depending on requirements, one might throw an error or terminate here. For this example, we proceed.
  }

  // Step 4: Build a frequency map to count occurrences of each number in the sequence.
  const numberFrequencies = {};
  for (const currentNumber of numericalSequence) {
    // Increment the count for the current number. If it's seen for the first time, initialize to 0 then increment.
    numberFrequencies[currentNumber] = (numberFrequencies[currentNumber] || 0) + 1;
  }

  // Step 5: Get all unique numbers (keys) from the frequency map, convert them to numbers, and sort them numerically.
  const sortedUniqueNumbers = Object.keys(numberFrequencies)
                                    .map(keyString => Number(keyString))
                                    .sort((numA, numB) => numA - numB);

  // Core algorithm: A two-pointer approach to "consume" numbers.
  // This logic aims to reduce counts of numbers that appear multiple times,
  // prioritizing consumption from the smallest and largest available numbers.
  let leftPointerIndex = 0;
  let rightPointerIndex = sortedUniqueNumbers.length - 1;

  // Loop continues as long as the pointers haven't crossed each other.
  while (leftPointerIndex <= rightPointerIndex) {
    const leftKey = sortedUniqueNumbers[leftPointerIndex];
    const rightKey = sortedUniqueNumbers[rightPointerIndex];

    // Defensive check for undefined keys, though pointer logic should prevent this with valid inputs.
    if (leftKey === undefined || rightKey === undefined) {
        break;
    }

    let currentLeftCount = numberFrequencies[leftKey];
    let currentRightCount = numberFrequencies[rightKey];

    // If the left element has 1 or fewer occurrences, it cannot be "consumed" in pairs.
    // Move the left pointer forward if it hasn't met or crossed the right pointer.
    if (currentLeftCount <= 1 && leftPointerIndex < rightPointerIndex) {
      leftPointerIndex++;
      continue; // Proceed to the next iteration.
    }

    // If the right element has 1 or fewer occurrences, it cannot be "consumed" in pairs.
    // Move the right pointer backward if it hasn't met or crossed the left pointer.
    if (currentRightCount <= 1 && leftPointerIndex < rightPointerIndex) {
      rightPointerIndex--;
      continue; // Proceed to the next iteration.
    }

    // If pointers have met or crossed, handle the final adjustment for the meeting point.
    if (leftPointerIndex >= rightPointerIndex) {
      // If the element at the meeting point has 2 or more occurrences, apply specific logic:
      // If the count is odd, one instance remains (e.g., 3 becomes 1).
      // If the count is even, all instances are "consumed" (e.g., 2 becomes 0, 4 becomes 0).
      if (currentLeftCount >= 2) {
        numberFrequencies[leftKey] = currentLeftCount % 2;
      }
      break; // Exit the loop as processing is complete.
    } else {
      // If both elements have counts greater than 1 and pointers are distinct,
      // "consume" one instance from both the left and right ends.
      numberFrequencies[leftKey]--;
      numberFrequencies[rightKey]--;
    }
  }

  // Step 6: Count how many unique numbers ultimately have exactly one occurrence left.
  let finalUniqueCount = 0;
  for (const uniqueNum of sortedUniqueNumbers) {
    if (numberFrequencies[uniqueNum] === 1) {
      finalUniqueCount++;
    }
  }

  // Step 7: Display the final calculated result.
  printOutputResult(finalUniqueCount);
};

// Entry point of the script:
// First, acquire the raw input, then pass it to the core logic function for processing.
executeCoreLogic(acquireInputData());