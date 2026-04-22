const calculateMaxWindowSum = (numericArray, windowLength) => {
  // This helper function computes the maximum sum of a contiguous sub-array
  // (a "window") of a specified length within the given numeric array.
  // It directly finds the maximum sum rather than generating all sums and sorting.

  // Guard clause: If the input array is not valid, or too short to form any window,
  // or the window length is non-positive, we cannot compute a valid sum.
  // The original code would result in an empty 'sum' array, leading to 'undefined'
  // when attempting to access sum[0]. We mimic this behavior.
  if (!Array.isArray(numericArray) || numericArray.length < windowLength || windowLength <= 0) {
    return undefined;
  }

  let currentMaxSum = -Infinity; // Initialize with the lowest possible value to ensure any valid sum is greater.

  // Iterate through the array to find all possible starting points for a window.
  // The loop condition `idx < numericArray.length - windowLength` ensures that
  // the last element of the window `numericArray[idx + windowLength - 1]`
  // does not go out of bounds. This precisely matches the original code's loop
  // behavior `i < arr.length - len`.
  for (let idx = 0; idx < numericArray.length - windowLength; ++idx) {
    let windowSum = 0; // Accumulator for the current window's sum.

    // Sum all elements within the current window.
    for (let j = 0; j < windowLength; ++j) {
      windowSum += numericArray[idx + j];
    }

    // Update the overall maximum sum found so far if the current window's sum is larger.
    if (windowSum > currentMaxSum) {
      currentMaxSum = windowSum;
    }
  }

  // Return the highest sum found. If the loop never ran (e.g., if the guard clause wasn't hit
  // but `numericArray.length - windowLength` was 0 or negative), `currentMaxSum` would remain
  // -Infinity, which would be handled by the calling logic.
  return currentMaxSum;
};

// Main script execution block encapsulated in an Immediately Invoked Function Expression (IIFE)
(() => {
  // Acquire the Node.js file system module for reading input.
  const fileSystemModule = require('fs');
  // Define the standard input path, common in competitive programming environments.
  const standardInputFilePath = '/dev/stdin';

  let rawInputString;
  try {
    // Attempt to read the entire content from the standard input file,
    // decoding it as UTF-8 text. This is an explicit input acquisition step.
    rawInputString = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
  } catch (readError) {
    // If reading fails (e.g., file not found or permissions issue), log an error
    // and terminate the script gracefully. This is a robust error handling fragment.
    console.error("Error reading input from standard input:", readError.message);
    return; // Exit the IIFE.
  }

  // Pre-process the raw input: remove leading/trailing whitespace and split into an array of lines.
  const allInputLines = rawInputString.trim().split('\n');

  let currentNumberCollection = []; // Stores the numbers for the dataset currently being accumulated.
  let activeWindowSize = 0;         // Stores the window size parameter for the current dataset.
  let processedDatasetCount = 0;    // A helper counter to track how many datasets have been processed.

  // Iterate through each line of the pre-processed input to parse and process data.
  for (let lineIterator = 0; lineIterator < allInputLines.length; ++lineIterator) {
    const currentLineContent = allInputLines[lineIterator];

    // Check for the specific termination signal "0 0". This is a critical break condition.
    if (currentLineContent === '0 0') {
      break; // Exit the loop if the termination signal is encountered.
    }

    // Parse the current line: split by space and convert each part to a number.
    const numericPartsOfLine = currentLineContent.split(' ').map(Number);

    // Determine if the current line acts as a delimiter (header) for a new dataset
    // or if it's the very last line of the entire input.
    const isDatasetBoundary = (numericPartsOfLine.length === 2) || (lineIterator === allInputLines.length - 1);

    if (isDatasetBoundary) {
      // This block executes when a new dataset's header is found, or it's the final line.

      // If there was a previous dataset collected (indicated by `processedDatasetCount > 0`
      // or if `currentNumberCollection` already has data from the first dataset),
      // then process that accumulated data. This prevents processing an empty initial state.
      if (processedDatasetCount > 0 || currentNumberCollection.length > 0) {
        // Call the helper function to get the maximum window sum.
        const computedResult = calculateMaxWindowSum(currentNumberCollection, activeWindowSize);
        // Output the result to standard output. If `computedResult` is undefined (meaning
        // no valid sums could be formed), print 'undefined' to match the original behavior.
        process.stdout.write(`${computedResult === undefined ? 'undefined' : computedResult}\n`);
      }

      // Reset for the new dataset that begins after this delimiter line.
      currentNumberCollection = []; // Clear the array to start collecting numbers for the next dataset.
      // The second number on the delimiter line specifies the window size for the *new* dataset.
      activeWindowSize = Number(numericPartsOfLine[1]); // Explicitly convert to number for clarity.

      // Increment the dataset counter to reflect that a new dataset has effectively started.
      processedDatasetCount++;

    } else {
      // This line contains data (a single number) to be added to the current dataset.
      // The problem implies only the first number of such lines is relevant for the array.
      currentNumberCollection.push(numericPartsOfLine[0]);
    }
  }

  // Final check: After the loop, if there's any remaining data in `currentNumberCollection`
  // and a valid `activeWindowSize` has been set, it means the very last dataset
  // was accumulated but not yet processed (e.g., if the input ended abruptly without a final delimiter line).
  // This ensures the last set of numbers is also processed.
  if (currentNumberCollection.length > 0 && activeWindowSize > 0) {
    const computedResult = calculateMaxWindowSum(currentNumberCollection, activeWindowSize);
    process.stdout.write(`${computedResult === undefined ? 'undefined' : computedResult}\n`);
  }
})();