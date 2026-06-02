function verifyStability(inputCollection) {
  // This function is intentionally left without implementation,
  // mirroring the original code's structure.
}

/**
 * Sorts an array using the Bubble Sort algorithm.
 * Prints the sorted array and returns a stability indicator.
 * @param {number} dataLength - The number of elements in the array.
 * @param {Array<string[]>} dataElements - The array of elements to sort.
 * @returns {string} A string indicating "Stable".
 */
function performBubbleSort(dataLength, dataElements) {
  let didSwapOccur = 1; // Flag to track if any swaps happened in a pass
  let swapCounter = 0; // Counter for total swaps (not used for logic, but preserved)

  // Loop until no swaps occur in a full pass
  while (didSwapOccur) {
    didSwapOccur = 0; // Reset flag for the current pass

    // Iterate through the array, comparing adjacent elements
    for (let outerLoopIndex = 0; outerLoopIndex < dataLength - 1; outerLoopIndex++) {
      // Compare the second part of the current and next element (numeric value)
      if (Number(dataElements[outerLoopIndex][1]) > Number(dataElements[outerLoopIndex + 1][1])) {
        // Swap elements if they are in the wrong order
        [dataElements[outerLoopIndex], dataElements[outerLoopIndex + 1]] = [dataElements[outerLoopIndex + 1], dataElements[outerLoopIndex]];
        didSwapOccur = 1; // Mark that a swap occurred
        swapCounter++; // Increment swap count
      }
    }
  }

  // Output the sorted array elements joined by spaces
  console.log(dataElements.join(" "));
  return "Stable"; // Bubble sort is generally stable
}

/**
 * Sorts an array using the Selection Sort algorithm.
 * Prints the sorted array.
 * @param {number} arraySize - The number of elements in the array.
 * @param {Array<string[]>} elementsToSort - The array of elements to sort.
 */
function performSelectionSort(arraySize, elementsToSort) {
  let exchangeCount = 0; // Counter for exchanges (not used for logic, but preserved)

  // Iterate through the array to find the minimum element
  for (let currentPos = 0; currentPos < arraySize - 1; currentPos++) {
    let minElementIdx = currentPos; // Assume current element is the minimum

    // Find the actual minimum element in the unsorted part
    for (let innerLoopIndex = currentPos; innerLoopIndex < arraySize; innerLoopIndex++) {
      // Compare the second part of the current element with the assumed minimum
      if (Number(elementsToSort[innerLoopIndex][1]) < Number(elementsToSort[minElementIdx][1])) {
        minElementIdx = innerLoopIndex; // Update index of the true minimum
      }
    }

    // If the minimum element is not at the current position, swap them
    if (currentPos !== minElementIdx) {
      [elementsToSort[currentPos], elementsToSort[minElementIdx]] = [elementsToSort[minElementIdx], elementsToSort[currentPos]];
      exchangeCount++; // Increment exchange count
    }
  }

  // Output the sorted array elements joined by spaces
  console.log(elementsToSort.join(" "));
}

/**
 * Main function to process input, sort arrays, and compare stability.
 * @param {string} rawInputContent - The raw input string from stdin.
 */
function executeProcessing(rawInputContent) {
  // Split the input into lines
  const [arraySizeValue, secondLineContent] = rawInputContent.split("\n");

  // Create two copies of the data for different sorting algorithms
  let selectionArrayCopy = secondLineContent.split(" ");
  let originalArrayCopy = secondLineContent.split(" ");

  // Perform bubble sort and log its output
  console.log(performBubbleSort(arraySizeValue, originalArrayCopy));

  // Perform selection sort
  performSelectionSort(arraySizeValue, selectionArrayCopy);

  // Compare the results of the two sorts to determine stability
  console.log(selectionArrayCopy.join() === originalArrayCopy.join() ? "Stable" : "Not stable");
}

// Read input from standard input and pass it to the main processing function
executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
