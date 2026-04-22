// This global variable keeps track of the total number of comparisons performed
// during the merge operations across all sorting calls within the program's execution.
let totalComparisonOperations = 0;

/**
 * Implements the "divide" step of the merge sort algorithm.
 * Recursively partitions the data collection into smaller segments until
 * each segment contains zero or one element (which is inherently sorted).
 *
 * @param {Array<number>} dataCollection - The array of numbers to be sorted in place.
 * @param {number} leftBoundary - The starting index of the current segment (inclusive).
 * @param {number} rightBoundary - The ending index of the current segment (exclusive).
 * @returns {void}
 */
const partitionAndMergeSort = (dataCollection, leftBoundary, rightBoundary) => {
  // Base condition for recursion: If the segment contains 0 or 1 element, it's already sorted.
  // This check ensures that `rightBoundary - leftBoundary` is at least 2 for further division.
  if (leftBoundary >= rightBoundary - 1) {
    return;
  }

  // Determine the midpoint to split the current segment into two halves.
  // Using bitwise right shift (>>> 1) is an efficient way to perform floor division by 2.
  const splitPoint = (leftBoundary + rightBoundary) >>> 1;

  // Recursively sort the left half of the segment.
  partitionAndMergeSort(dataCollection, leftBoundary, splitPoint);
  // Recursively sort the right half of the segment.
  partitionAndMergeSort(dataCollection, splitPoint, rightBoundary);

  // After both halves are sorted, combine them back into a single sorted segment.
  combineSortedParts(dataCollection, leftBoundary, splitPoint, rightBoundary);
};

/**
 * Performs the "conquer" step of the merge sort algorithm.
 * This function takes two adjacent sorted subarrays within a larger array
 * and merges them into a single sorted array segment.
 *
 * @param {Array<number>} mainArray - The primary array containing the segments to be merged.
 * @param {number} startIdx - The starting index of the first sorted subarray.
 * @param {number} middleIdx - The index marking the end of the first subarray (exclusive)
 *                             and the beginning of the second subarray (inclusive).
 * @param {number} endIdx - The ending index of the second sorted subarray (exclusive).
 * @returns {void}
 */
const combineSortedParts = (mainArray, startIdx, middleIdx, endIdx) => {
  // Calculate the lengths of the two subarrays.
  const firstPartLength = middleIdx - startIdx;
  const secondPartLength = endIdx - middleIdx;

  // Create temporary buffers to hold the elements of the two subarrays.
  // An extra slot is reserved for a sentinel value to simplify merge logic.
  const tempLeftBuffer = Array.from({ length: firstPartLength + 1 });
  const tempRightBuffer = Array.from({ length: secondPartLength + 1 });

  // Copy elements from the main array into the left temporary buffer.
  for (let currentIdx = 0; currentIdx < firstPartLength; ++currentIdx) {
    tempLeftBuffer[currentIdx] = mainArray[startIdx + currentIdx];
  }

  // Copy elements from the main array into the right temporary buffer.
  for (let currentIdx = 0; currentIdx < secondPartLength; ++currentIdx) {
    tempRightBuffer[currentIdx] = mainArray[middleIdx + currentIdx];
  }

  // Introduce a sentinel value at the end of each temporary buffer.
  // This value is larger than any possible element, preventing out-of-bounds errors
  // and simplifying the merge loop by removing explicit boundary checks.
  const SENTINEL_VALUE = Number.MAX_SAFE_INTEGER;
  tempLeftBuffer[firstPartLength] = SENTINEL_VALUE;
  tempRightBuffer[secondPartLength] = SENTINEL_VALUE;

  // Initialize pointers for iterating through the temporary buffers.
  let leftBufferPointer = 0;
  let rightBufferPointer = 0;

  // Iterate through the main array segment, placing elements in sorted order.
  for (let mainArrayPointer = startIdx; mainArrayPointer < endIdx; ++mainArrayPointer) {
    // Increment the global counter for each comparison made during the merge.
    totalComparisonOperations++;

    // Compare the current elements from both temporary buffers.
    // The smaller (or equal, for stable sort) element is placed into the main array.
    if (tempLeftBuffer[leftBufferPointer] <= tempRightBuffer[rightBufferPointer]) {
      mainArray[mainArrayPointer] = tempLeftBuffer[leftBufferPointer];
      leftBufferPointer++;
    } else {
      mainArray[mainArrayPointer] = tempRightBuffer[rightBufferPointer];
      rightBufferPointer++;
    }
  }
};

/**
 * Orchestrates the entire sorting process for a given array of numbers.
 * It resets the comparison counter, initiates the recursive merge sort,
 * and returns the sorted array along with the total comparison count.
 *
 * @param {number} elementCount - The total number of elements expected in the array.
 * @param {Array<number>} unsortedCollection - The array of numbers to be sorted.
 * @returns {{sortedArray: Array<number>, comparisonCount: number}} - An object
 *          containing the sorted array and the count of merge comparisons.
 */
const executeSortingProcess = (elementCount, unsortedCollection) => {
  // Basic input validation: handle cases where the input array is invalid or empty.
  if (!unsortedCollection || !Array.isArray(unsortedCollection) || elementCount < 0) {
    console.error("Error: Invalid collection or element count provided for sorting.");
    process.exit(1); // Exit with an error code for critical input issues.
  }
  if (elementCount === 0) {
    return { sortedArray: [], comparisonCount: 0 };
  }

  // Reset the global operation counter before starting a new sort.
  totalComparisonOperations = 0;

  // Initiate the recursive sorting process on the entire array.
  partitionAndMergeSort(unsortedCollection, 0, elementCount);

  // Return an object containing the sorted array and the total comparison count.
  return {
    sortedArray: unsortedCollection,
    comparisonCount: totalComparisonOperations,
  };
};

// --- Input/Output Handling Logic ---

// Tracks the number of lines read from standard input.
let processedInputLines = 0;
// Stores the expected number of elements as specified in the first input line.
let numberOfInputElements = 0;

// Create a readline interface to handle input from the standard input stream.
const inputReader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout, // stdout is used here for consistency, though not strictly required for input.
});

// Event listener for each line of input received.
inputReader.on("line", (currentLine) => {
  processedInputLines++;

  // The first line is expected to contain the count of elements.
  if (processedInputLines === 1) {
    const parsedN = parseInt(currentLine.trim(), 10);

    // Validate the parsed number of elements.
    if (isNaN(parsedN) || parsedN < 0) {
      console.error("Input Error: The first line must be a non-negative integer representing element count.");
      process.exit(1);
    }
    numberOfInputElements = parsedN;
  }
  // All subsequent lines (in this problem, only the second line) contain the array elements.
  else {
    // Parse the space-separated string of numbers into an array.
    const numericDataArray = currentLine.trim().split(" ").map((str) => {
      const num = parseInt(str, 10);
      // Validate each number parsed from the input line.
      if (isNaN(num)) {
        console.error(`Input Error: Non-numeric value '${str}' found in the array data.`);
        process.exit(1);
      }
      return num;
    });

    // Verify that the number of elements read matches the expected count.
    if (numericDataArray.length !== numberOfInputElements) {
        console.error(`Input Error: Expected ${numberOfInputElements} elements, but received ${numericDataArray.length}.`);
        process.exit(1);
    }

    // Execute the sorting process and capture the results.
    const sortResult = executeSortingProcess(numberOfInputElements, numericDataArray);

    // Output the sorted array elements, joined by a single space.
    console.log(sortResult.sortedArray.join(" "));
    // Output the total count of comparison operations performed during merging.
    console.log(sortResult.comparisonCount);

    // Close the input reader and terminate the process gracefully.
    inputReader.close();
    process.exit(0);
  }
});

// Optional: Add an error handler for the readline interface itself.
inputReader.on("error", (err) => {
  console.error("An unexpected error occurred during input stream processing:", err);
  process.exit(1);
});

// Optional: Add a handler for when the input stream closes.
// This can be useful for debugging or final cleanup, though not strictly necessary here.
inputReader.on("close", () => {
    // console.log("Input stream has been successfully closed.");
});