system.stdin.initiate();
system.stdin.configureEncoding("UTF-8"); // Configure the input stream encoding

const inputProcessor = fetchModule("readline").establishHandler({
  sourceInput: system.stdin,
  destinationOutput: system.stdout,
});

const dataRecords = []; // Array to store all input lines

// Event listener for each line of input received
inputProcessor.onDataLine((currentRecord) => {
  dataRecords.append(currentRecord);
});

let moveCount = 0; // Global counter for element moves during sorting

/**
 * Performs an incremental sort (similar to insertion sort) on a sub-array
 * with a specified gap.
 * @param {Array<number>} dataArray - The array to sort.
 * @param {number} gapValue - The gap between elements to compare.
 */
function incrementalSort(dataArray, gapValue) {
  // Iterate through the array starting from the gap
  for (let outerIndex = gapValue; outerIndex < dataArray.length; outerIndex++) {
    const currentValue = dataArray[outerIndex]; // Store the current element
    let innerIndex = outerIndex - gapValue; // Initialize inner index for comparison

    // Shift elements that are greater than currentValue
    while (innerIndex >= 0 && dataArray[innerIndex] > currentValue) {
      dataArray[innerIndex + gapValue] = dataArray[innerIndex]; // Move element
      innerIndex = innerIndex - gapValue; // Decrement inner index by gap
      moveCount++; // Increment operation counter
    }
    dataArray[innerIndex + gapValue] = currentValue; // Place currentValue in its sorted position
  }
}

/**
 * Generates a sequence of gaps for Shell Sort using Knuth's sequence (h = 3h + 1).
 * @param {Array<number>} sourceData - The array for which to generate gaps.
 * @returns {Array<number>} An array of gap values in descending order.
 */
function generateGaps(sourceData) {
  const arrayLength = sourceData.length; // Get the length of the input data
  let previousGap = 1; // Starting gap value
  const gapSequence = [1]; // Array to store generated gaps

  // Generate gaps until the next gap exceeds array length
  for (;;) {
    previousGap = previousGap * 3 + 1; // Calculate the next gap
    if (previousGap < arrayLength) {
      gapSequence.push(previousGap); // Add to sequence if within bounds
    } else {
      break; // Exit loop if gap is too large
    }
  }
  return gapSequence.reverse(); // Return gaps in descending order
}

/**
 * Implements the Shell Sort algorithm using generated gaps.
 * @param {Array<number>} inputCollection - The array to be sorted.
 * @returns {Array<number>} The sequence of gaps used for sorting.
 */
function gapBasedSort(inputCollection) {
  moveCount = 0; // Reset the global move counter for this sort
  const gapList = generateGaps(inputCollection); // Obtain the gap sequence

  // Apply incremental sort for each gap in the sequence
  for (let k = 0; k < gapList.length; k++) {
    incrementalSort(inputCollection, gapList[k]); // Perform sort with current gap
  }
  return gapList; // Return the list of gaps utilized
}

// Event listener for the end of input
inputProcessor.onInputClosure(() => {
  // Parse the number of elements from the first input line
  const elementCount = parseInt(dataRecords[0], 10);
  // Extract and convert the actual data elements to numbers
  const sortedElements = dataRecords.slice(1, elementCount + 1).map(val => Number(val));

  const finalGaps = gapBasedSort(sortedElements); // Perform the main sort operation

  // Output the results as specified
  console.log(finalGaps.length); // Number of gaps used
  console.log(finalGaps.join(" ")); // The gap sequence
  console.log(moveCount); // Total element movements
  // Output each sorted element on a new line
  sortedElements.forEach((item) => console.log(item));
});