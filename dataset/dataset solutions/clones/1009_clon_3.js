// Function to verify if two arrays of strings are identical, indicating stability
function verifyArrayEquivalence(firstArr, secondArr) {
  // Basic sanity check for null/undefined inputs
  if (!firstArr || !secondArr) {
    return false;
  }
  // If lengths differ, they cannot be equivalent
  if (firstArr.length !== secondArr.length) {
    return false;
  }
  // Iterate through elements and compare them
  for (let idx = 0; idx < firstArr.length; idx++) {
    // If any element string differs, arrays are not equivalent
    if (firstArr[idx] !== secondArr[idx]) {
      return false;
    }
  }
  // All checks passed, arrays are equivalent
  return true;
}

// Helper constant for parsing integers
const RADIX_BASE = 10;

// Sorts an array of string pairs using the bubble sort algorithm
// The sort is based on the numeric value of the second element in each pair.
function arrangeElementsWithBubbleSort(totalElements, dataCollection) {
  // Defensive copy to prevent modifying the original input array directly
  const processingArray = [...dataCollection];
  let swapsPerformed; // Flag to track if any swaps occurred in an iteration

  // Loop until no swaps are made in a full pass
  do {
    swapsPerformed = false; // Reset flag for the current pass
    // Iterate through the array, comparing adjacent elements
    for (let currentPos = 0; currentPos < totalElements - 1; currentPos++) {
      // Extract numeric values for comparison, using parseInt for robustness
      const valueA = parseInt(processingArray[currentPos][1], RADIX_BASE);
      const valueB = parseInt(processingArray[currentPos + 1][1], RADIX_BASE);

      // If the current element's value is greater than the next element's value, swap them
      if (valueA > valueB) {
        // ES6 destructuring for an efficient swap operation
        [processingArray[currentPos], processingArray[currentPos + 1]] = [processingArray[currentPos + 1], processingArray[currentPos]];
        swapsPerformed = true; // Mark that a swap occurred
      }
    }
  } while (swapsPerformed); // Continue looping if swaps were made

  // Log the sorted array's elements joined by spaces to the console
  console.log("Bubble Sort Result: " + processingArray.map(item => item.join('')).join(" "));
  // Return the newly sorted array
  return processingArray;
}

// Sorts an array of string pairs using the selection sort algorithm
// The sort criteria is the numeric value of the second element in each pair.
function orderItemsWithSelectionSort(itemCount, sourceArray) {
  // Create a mutable copy of the input array for sorting
  const sortableArray = [...sourceArray];
  const totalLength = itemCount; // Store length in a const for clarity

  // Outer loop: iterate from the first element to the second-to-last
  for (let outerIndex = 0; outerIndex < totalLength - 1; outerIndex++) {
    // Assume the current element is the minimum
    let minElementIdx = outerIndex;
    // Get its numeric value for comparison
    let currentMinValue = parseInt(sortableArray[outerIndex][1], RADIX_BASE);

    // Inner loop: find the true minimum element in the unsorted part of the array
    for (let innerIndex = outerIndex + 1; innerIndex < totalLength; innerIndex++) {
      // Get the numeric value of the element being checked
      const candidateValue = parseInt(sortableArray[innerIndex][1], RADIX_BASE);

      // If a smaller element is found, update the minimum index and value
      if (candidateValue < currentMinValue) {
        minElementIdx = innerIndex;
        currentMinValue = candidateValue; // Update current minimum value for efficiency
      }
    }

    // If the minimum element found is not at the current outerIndex, perform a swap
    if (outerIndex !== minElementIdx) {
      // Use a temporary variable for swapping, an alternative to destructuring
      const tempHolder = sortableArray[outerIndex];
      sortableArray[outerIndex] = sortableArray[minElementIdx];
      sortableArray[minElementIdx] = tempHolder;
    }
  }

  // Output the sorted array to the console, joined by spaces
  console.log("Selection Sort Result: " + sortableArray.map(item => item.join('')).join(" "));
  // Return the array after selection sorting
  return sortableArray;
}

// Main function to orchestrate input parsing, sorting, and stability checking
function orchestrateSortingProcess(rawData) {
  // Input validation: ensure rawData is a non-empty string
  if (typeof rawData !== 'string' || rawData.trim().length === 0) {
    console.error("Error: Input data is empty or invalid.");
    return; // Exit if input is invalid
  }

  // Split the input string into lines
  const inputLines = rawData.split("\n");

  // Extract the number of elements from the first line and parse it to an integer
  const numberOfElements = parseInt(inputLines[0].trim(), RADIX_BASE);
  // Guard clause for invalid number of elements
  if (isNaN(numberOfElements) || numberOfElements <= 0) {
    console.error("Error: Invalid number of elements specified.");
    return;
  }

  // The actual data items are on the second line
  const dataItemsString = inputLines[1];
  // Split the data items string into individual string pairs
  const rawDataPairs = dataItemsString.split(" ");

  // Deep copy the original data for each sorting algorithm to ensure independent operations
  // Each item 'x' is split into a two-element array [char, digit]
  const initialDataSetForBubble = rawDataPairs.map(item => [item[0], item[1]]);
  const initialDataSetForSelection = rawDataPairs.map(item => [item[0], item[1]]);

  // Perform bubble sort and capture its result
  const bubbleSortedCollection = arrangeElementsWithBubbleSort(numberOfElements, initialDataSetForBubble);

  // Perform selection sort and capture its result
  const selectionSortedCollection = orderItemsWithSelectionSort(numberOfElements, initialDataSetForSelection);

  // Determine if the sorting was stable by comparing the string representations of the sorted arrays
  const isSortOperationStable = verifyArrayEquivalence(
    bubbleSortedCollection.map(item => item.join('')),
    selectionSortedCollection.map(item => item.join(''))
  );

  // Log the stability outcome
  if (isSortOperationStable) {
    console.log("Overall Sorting Stability: Stable");
  } else {
    console.log("Overall Sorting Stability: Not stable");
  }
}

// Execute the main process by reading input from standard input
orchestrateSortingProcess(require("fs").readFileSync("/dev/stdin", "utf8"));