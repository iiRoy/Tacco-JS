const fileSystem = require('node:fs');

// --- Configuration Constants ---
const INPUT_SOURCE_PATH = '/dev/stdin';
const WEIGHT_OVERLOAD_THRESHOLD = 150;
const EVALUATION_RESULT_SUCCESS = "PASSED_VALIDATION";
const EVALUATION_RESULT_FAILURE = "FAILED_VALIDATION";

// --- Utility Functions ---

/**
 * Safely reads and preprocesses input data from a specified file path.
 * Filters out empty lines and trims whitespace from each line.
 * @param {string} filePath The path to the input file.
 * @returns {string[]} An array of non-empty, trimmed lines from the input file.
 */
const fetchAndPrepareInputLines = (filePath) => {
  try {
    const rawContent = fileSystem.readFileSync(filePath, 'utf8');
    // Remove overall leading/trailing whitespace, then split into lines.
    // Filter out any lines that become empty after trimming.
    return rawContent.trim().split('\n').filter(line => line.length > 0);
  } catch (error) {
    // Log the error and return an empty array to prevent application crash.
    console.error(`Critical Error: Unable to read input from ${filePath}. Details: ${error.message}`);
    return [];
  }
};

/**
 * Parses a string containing space-separated numbers into an array of integers.
 * Performs robust parsing and validation for each segment.
 * @param {string} textLine The string line to be parsed.
 * @returns {number[]} An array of parsed integer values.
 * @throws {Error} If the input is not a string or if any segment cannot be parsed as a valid integer.
 */
const extractNumericValues = (textLine) => {
  if (typeof textLine !== 'string' || textLine.trim().length === 0) {
    throw new Error("Input for numeric value extraction must be a non-empty string.");
  }
  // Split by one or more whitespace characters, filter out any empty strings resulting from multiple spaces.
  const segments = textLine.split(/\s+/).filter(Boolean);
  const parsedNumbers = segments.map(segment => {
    const numValue = Number.parseInt(segment, 10);
    if (Number.isNaN(numValue)) {
      throw new Error(`Invalid data format: '${segment}' cannot be interpreted as a number.`);
    }
    return numValue;
  });
  return parsedNumbers;
};

/**
 * Determines if two one-dimensional numeric ranges [start1, end1] and [start2, end2] overlap.
 * @param {number} range1Start The starting point of the first range.
 * @param {number} range1End The ending point of the first range.
 * @param {number} range2Start The starting point of the second range.
 * @param {number} range2End The ending point of the second range.
 * @returns {boolean} True if the ranges intersect or touch, false otherwise.
 */
const doRangesOverlap = (range1Start, range1End, range2Start, range2End) => {
  // Two ranges overlap if the start of one is less than or equal to the end of the other,
  // AND the end of the first is greater than or equal to the start of the second.
  return range1Start <= range2End && range1End >= range2Start;
};

// --- Main Application Logic ---

// Load all input lines into a mutable queue for sequential processing.
let lineProcessingQueue = fetchAndPrepareInputLines(INPUT_SOURCE_PATH);

// Continue processing test cases as long as there are lines in the queue.
while (lineProcessingQueue.length > 0) {
  // Read the first line to determine the number of elements for the current test case.
  const testCaseSizeLine = lineProcessingQueue.shift();
  const currentTestCaseSize = Number.parseInt(testCaseSizeLine, 10);

  // Termination Condition: A size of 0 or an invalid number (NaN) signifies the end of input.
  if (Number.isNaN(currentTestCaseSize) || currentTestCaseSize === 0) {
    break; // Exit the main program loop.
  }

  // Initialize data storage and overall status for the current test case.
  const caseDataElements = [];
  let testCaseEvaluationStatus = EVALUATION_RESULT_SUCCESS; // Optimistically assume success.

  // --- Phase 1: Populate Data Elements for the Current Test Case ---
  for (let elementIndex = 0; elementIndex < currentTestCaseSize; ++elementIndex) {
    // Guard against premature end of input.
    if (lineProcessingQueue.length === 0) {
      console.error(`Input Error: Expected ${currentTestCaseSize} data entries, but input stream ended prematurely.`);
      testCaseEvaluationStatus = EVALUATION_RESULT_FAILURE;
      break; // Stop collecting data for this case.
    }

    const currentDataLine = lineProcessingQueue.shift();
    try {
      const [initialItemWeight, rangeLowerBoundary, rangeUpperBoundary] = extractNumericValues(currentDataLine);
      // Store data as structured objects for improved clarity and access.
      caseDataElements.push({
        itemWeight: initialItemWeight,
        rangeStart: rangeLowerBoundary,
        rangeEnd: rangeUpperBoundary
      });
    } catch (parsingError) {
      // If any line fails to parse, the entire test case is deemed invalid.
      console.error(`Data Parsing Error on line '${currentDataLine}': ${parsingError.message}`);
      testCaseEvaluationStatus = EVALUATION_RESULT_FAILURE;
      break; // Stop collecting data.
    }
  }

  // If an error occurred during data acquisition, output failure and proceed to the next potential test case.
  if (testCaseEvaluationStatus === EVALUATION_RESULT_FAILURE) {
    console.log(EVALUATION_RESULT_FAILURE);
    continue; // Skip core logic for this corrupted case.
  }

  // --- Phase 2: Perform Core Overlap and Weight Accumulation Logic ---
  // Iterate through each data element as a 'primary' element.
  for (let primaryElementIdx = 0; primaryElementIdx < currentTestCaseSize; ++primaryElementIdx) {
    // Optimization: If the case is already marked as a failure, no need for further checks.
    if (testCaseEvaluationStatus === EVALUATION_RESULT_FAILURE) {
      break; // Exit the primary element loop.
    }

    const primaryElement = caseDataElements[primaryElementIdx];
    // Defensive check: Ensure the element exists (should be guaranteed by Phase 1).
    if (!primaryElement) {
        console.error(`Internal Data Anomaly: Primary element at index ${primaryElementIdx} is missing.`);
        testCaseEvaluationStatus = EVALUATION_RESULT_FAILURE;
        break;
    }

    let accumulatedWeightForPrimary = primaryElement.itemWeight; // Start with the primary element's own weight.

    // Compare the primary element against all other elements in the set.
    for (let secondaryElementIdx = 0; secondaryElementIdx < currentTestCaseSize; ++secondaryElementIdx) {
      // Skip comparison of an element with itself.
      if (primaryElementIdx === secondaryElementIdx) {
        continue;
      }

      const secondaryElement = caseDataElements[secondaryElementIdx];
      // Defensive check: Ensure the secondary element exists.
      if (!secondaryElement) {
          console.error(`Internal Data Anomaly: Secondary element at index ${secondaryElementIdx} is missing.`);
          testCaseEvaluationStatus = EVALUATION_RESULT_FAILURE;
          break; // Break inner loop if data integrity is compromised.
      }

      // Check for range intersection between the primary and secondary elements.
      if (doRangesOverlap(
            primaryElement.rangeStart, primaryElement.rangeEnd,
            secondaryElement.rangeStart, secondaryElement.rangeEnd
          )) {
        // If ranges overlap, add the secondary element's weight to the primary's accumulation.
        accumulatedWeightForPrimary += secondaryElement.itemWeight;
      }

      // Immediately evaluate if the accumulated weight exceeds the defined threshold.
      if (accumulatedWeightForPrimary > WEIGHT_OVERLOAD_THRESHOLD) {
        testCaseEvaluationStatus = EVALUATION_RESULT_FAILURE; // Mark the entire case as a failure.
        break; // No further secondary comparisons needed for this primary element.
      }
    }
  }

  // --- Phase 3: Output the Final Result for the Current Test Case ---
  console.log(testCaseEvaluationStatus);
}

// Program execution concludes gracefully.