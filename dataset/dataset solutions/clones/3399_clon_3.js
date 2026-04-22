/**
 * @file This script processes a sequence of numbers to determine a specific maximum count.
 * It simulates a dynamic array (or list) manipulation based on comparisons
 * between consecutive elements of the input sequence.
 * This is a Type III clone, featuring extensive structural and semantic modifications
 * while preserving the core logical behavior.
 */

/**
 * Executes the main processing logic given raw input data.
 * This function is designed to handle a string input, parse it,
 * and then perform calculations to determine a final result.
 * @param {string} rawInputData - The raw string input, typically from stdin or a textarea.
 */
function processInputSequence(rawInputData) {
  // Defensive programming: check for valid input before processing.
  if (!rawInputData || typeof rawInputData !== 'string' || rawInputData.trim() === '') {
    console.error("Error: Input data is empty or invalid.");
    return; // Exit early if input is bad.
  }

  // Split the input into lines, robustly handling different line endings.
  const inputLines = rawInputData.split(/\r?\n/);

  // Validate the number of lines.
  if (inputLines.length < 2) {
    console.error("Error: Insufficient input lines. Expected at least two.");
    return;
  }

  // Parse the length of the main sequence from the first line.
  const sequenceLength = Number(inputLines[0]);
  if (isNaN(sequenceLength) || sequenceLength <= 0) {
    console.error(`Error: Invalid sequence length detected: "${inputLines[0]}". Must be a positive number.`);
    return;
  }

  // Parse the sequence of numbers from the second line.
  // Use map(Number) for concise conversion to numbers.
  const mainSequence = inputLines[1].split(" ").map(val => Number(val.trim()));

  // Validate the actual length of the parsed sequence against the declared length.
  if (mainSequence.length !== sequenceLength) {
    console.error(`Error: Mismatch in sequence length. Declared: ${sequenceLength}, Actual: ${mainSequence.length}.`);
    return;
  }

  // Initialize the dynamic counter array. The initial size is determined by the first element of mainSequence.
  // All elements are initially set to 1.
  const initialCounterSize = mainSequence[0];
  if (initialCounterSize <= 0 || isNaN(initialCounterSize)) {
    console.error(`Error: First element of the sequence must be a positive number for initialization. Found: ${mainSequence[0]}.`);
    return;
  }
  let dynamicCounters = Array(initialCounterSize).fill(1);

  // Variable to store the maximum count found in 'dynamicCounters' at the end.
  let overallMaxCount = 0;

  // Iterate through the main sequence, starting from the second element (index 1).
  for (let currentIdx = 1; currentIdx < sequenceLength; ++currentIdx) {
    const previousValueInSequence = mainSequence[currentIdx - 1];
    const currentValueInSequence = mainSequence[currentIdx];

    // --- State analysis of dynamicCounters ---
    // Determine if all elements in dynamicCounters are uniform and find the maximum value.
    let isUniformState = true;
    let currentMaxInDynamicCounters = 0;
    if (dynamicCounters.length > 0) {
      currentMaxInDynamicCounters = dynamicCounters[0];
      for (const countVal of dynamicCounters) {
        if (countVal !== dynamicCounters[0]) {
          isUniformState = false;
        }
        currentMaxInDynamicCounters = Math.max(currentMaxInDynamicCounters, countVal);
      }
    } else {
      // If dynamicCounters is empty, it's considered uniform (vacuously true) and max is 0.
      isUniformState = true;
      currentMaxInDynamicCounters = 0;
    }
    // --- End State analysis ---

    // Conditional logic based on sequence values and the state of dynamicCounters.
    if (currentValueInSequence > previousValueInSequence) {
      // If the current value is greater, extend dynamicCounters with new '1's.
      const difference = currentValueInSequence - previousValueInSequence;
      // Using concat creates a new array, which is a common functional pattern.
      dynamicCounters = dynamicCounters.concat(Array(difference).fill(1));
    } else if (isUniformState) {
      // If the current value is not greater AND dynamicCounters is uniform.
      // Increment a specific counter and truncate the array.
      const targetIndex = currentValueInSequence - 1;
      if (targetIndex >= 0 && targetIndex < dynamicCounters.length) {
        dynamicCounters[targetIndex]++;
      } else if (targetIndex < 0) {
        // Guard against negative index access, though it implies currentValueInSequence was <= 0.
        console.warn(`Warning: Attempted to access negative index (${targetIndex}). Skipping increment.`);
      }
      // Efficiently truncate the array by setting its length property.
      dynamicCounters.length = currentValueInSequence;
    } else { // if (!isUniformState)
      // If the current value is not greater AND dynamicCounters is NOT uniform.
      // Truncate and then find an element to increment.
      dynamicCounters.length = currentValueInSequence; // Truncate first.

      // Iterate backwards from the end of the (now truncated) array.
      // Find the first element that is not equal to the overall maximum observed.
      let incrementPerformed = false;
      for (let k = dynamicCounters.length - 1; k >= 0; --k) {
        if (dynamicCounters[k] !== currentMaxInDynamicCounters) {
          dynamicCounters[k]++;
          incrementPerformed = true;
          break; // Increment only one element.
        }
      }
      // Edge case: if after truncation, all remaining elements are equal to currentMaxInDynamicCounters,
      // and no increment was performed (which shouldn't happen if isUniformState was false and currentMaxInDynamicCounters was correctly calculated before truncation).
      // This part is an added safety or slight deviation if the original logic might imply it.
      // For strict clone, it's safer to omit this `if (!incrementPerformed)` block as the original logic implies an element *will* be found.
    }
  }

  // After the main loop, determine the final maximum count within dynamicCounters.
  // Reset overallMaxCount to ensure it captures the maximum from the final state.
  overallMaxCount = 0;
  for (const finalCount of dynamicCounters) {
    overallMaxCount = Math.max(overallMaxCount, finalCount);
  }

  // Output the final result.
  console.log(overallMaxCount.toString());
}

/**
 * This function provides a browser-specific entry point for testing.
 * It retrieves input from a DOM element and passes it to the main processing logic.
 * This is primarily for debugging and demonstration in a web environment.
 */
function executeInBrowserContext() {
  // Attempt to locate an input element by ID.
  const inputElement = document.getElementById("input");
  if (inputElement && inputElement.value) {
    processInputSequence(inputElement.value);
  } else {
    console.warn("Browser execution: Input element with ID 'input' not found or is empty.");
  }
}

// Determine the execution environment and call the main function accordingly.
// This supports both Node.js (for competitive programming platforms) and browser environments.
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment: read from standard input.
  const fs = require("fs");
  const stdInput = fs.readFileSync("/dev/stdin", "utf8");
  processInputSequence(stdInput);
} else if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // Browser environment: attach to a global property for manual triggering (e.g., via a button click).
  // The original code uses a debug() function, let's keep a similar pattern.
  window.executeMainLogicInBrowser = executeInBrowserContext;
  // Optionally, you might want to call it automatically on page load or when a specific event fires.
  // For this clone, we'll just expose it.
} else {
  console.error("Unsupported execution environment detected.");
}