"use strict";

/**
 * Processes raw input data to perform a series of operations,
 * including initial array population, dynamic additions,
 * sorting, and calculating a sum of top positive elements.
 * @param {string} rawInputString - The raw string input from stdin.
 */
function processDataEntry(rawInputString) {
  // Input parsing and initial setup
  const processedLines = rawInputString.trim().split("\n");

  // Extract configuration parameters from the first line
  const configValues = processedLines[0].split(" ");
  const initialElementCount = Number(configValues[0]); // Corresponds to N
  const dynamicOperationCount = Number(configValues[1]); // Corresponds to M

  // Initialize the primary data collection array
  // Uses map for direct number conversion
  let numberCollection = processedLines[1].split(" ").map(Number);

  // Helper function to swap elements in an array
  const swapElements = (arr, indexA, indexB) => {
    let tempValue = arr[indexA];
    arr[indexA] = arr[indexB];
    arr[indexB] = tempValue;
  };

  /**
   * Implements an ascending quicksort algorithm for a portion of an array.
   * This is a recursive partitioning sort.
   * @param {number} lowBoundary - The starting index of the sub-array to sort.
   * @param {number} highBoundary - The ending index of the sub-array to sort.
   */
  const performPartitionSort = (lowBoundary, highBoundary) => {
    // Base case: if the segment has 0 or 1 element, it's already sorted
    if (lowBoundary >= highBoundary) {
      return;
    }

    // Select the pivot element (middle element for simplicity)
    const pivotIndex = Math.floor((lowBoundary + highBoundary) / 2);
    const pivotValue = numberCollection[pivotIndex];

    let leftCursor = lowBoundary;
    let rightCursor = highBoundary;

    // Partitioning phase: move elements smaller than pivot to the left, larger to the right
    while (leftCursor <= rightCursor) {
      // Find an element on the left that is greater than or equal to the pivot
      while (numberCollection[leftCursor] < pivotValue) {
        leftCursor++;
      }
      // Find an element on the right that is less than or equal to the pivot
      while (numberCollection[rightCursor] > pivotValue) {
        rightCursor--;
      }

      // If pointers haven't crossed, swap elements and move cursors
      if (leftCursor <= rightCursor) {
        swapElements(numberCollection, leftCursor, rightCursor);
        leftCursor++;
        rightCursor--;
      }
    }

    // Recursively sort the two sub-arrays
    if (lowBoundary < rightCursor) {
      performPartitionSort(lowBoundary, rightCursor);
    }
    if (leftCursor < highBoundary) {
      performPartitionSort(leftCursor, highBoundary);
    }
  };

  // Process additional operations as specified by dynamicOperationCount
  // Loop starts from the second line of dynamic operations (index 2 in processedLines)
  for (let opCounter = 0; opCounter < dynamicOperationCount; ++opCounter) {
    const currentOpLine = processedLines[opCounter + 2].split(" "); // +2 because N and initial elements are lines 0 and 1
    const itemsToInsertCount = Number(currentOpLine[0]); // Corresponds to B
    const valueForInsertion = Number(currentOpLine[1]); // Corresponds to C

    // Add specified number of elements to the collection
    let currentInsertion = 0;
    while (currentInsertion < itemsToInsertCount) {
      numberCollection.push(valueForInsertion);
      currentInsertion++;
    }
  }

  // Sort the entire collection using the custom quicksort implementation
  // The highBoundary for quickSort should be array.length - 1 for 0-indexed arrays
  performPartitionSort(0, numberCollection.length - 1);

  // Calculate the sum of the 'initialElementCount' largest positive values
  let accumulatedSum = 0;
  let positiveValuesCounted = 0; // Tracks how many positive values have been added to the sum

  // Iterate from the end of the sorted array (largest elements) backwards
  for (let currentElementIdx = numberCollection.length - 1; currentElementIdx >= 0; --currentElementIdx) {
    const currentValue = numberCollection[currentElementIdx];

    // Only add positive values to the sum
    if (currentValue > 0) {
      accumulatedSum += currentValue;
      positiveValuesCounted++;

      // Stop once we have summed 'initialElementCount' positive values
      if (positiveValuesCounted === initialElementCount) {
        break;
      }
    } else {
      // Since the array is sorted in ascending order, if we encounter a non-positive
      // value, all subsequent values (at smaller indices) will also be non-positive or zero.
      // Therefore, we can safely terminate the loop early.
      break;
    }
  }

  // Output the final calculated sum
  console.log(accumulatedSum);
}

// Entry point for execution: reads input from stdin and passes it to the main processing function.
processDataEntry(require("fs").readFileSync("/dev/stdin", "utf8"));