process.stdin.resume(); // Continue reading from standard input
process.stdin.setEncoding("utf8"); // Set the encoding for input data

// Create an interface for reading lines from standard input
const inputProcessor = require("readline").createInterface({
  input: process.stdin, // Use standard input as the source
  output: process.stdout, // Use standard output for any prompts (though none are used here)
});

// Array to store all incoming lines from standard input
const inputBuffer = [];

// Event listener for each line received
inputProcessor.on("line", (currentLine) => {
  inputBuffer.push(currentLine); // Add the current line to our buffer
});

// Global counter for comparison operations during sorting
let operationCount = 0;

/**
 * Performs an insertion sort on a sub-array defined by a gap size.
 * This is a core component of Shell Sort.
 * @param {number[]} dataArray - The array to be sorted.
 * @param {number} gapSize - The interval between elements to be compared.
 */
function subArraySort(dataArray, gapSize) {
  // Iterate through the array starting from the gapSize-th element
  for (let idx = gapSize; idx < dataArray.length; idx++) {
    let currentValue = dataArray[idx]; // Store the current element to be inserted
    let subIdx = idx - gapSize; // Initialize the index for comparison in the sub-array

    // Move elements of dataArray[0...idx-gapSize] that are greater than currentValue
    // to one position ahead of their current position
    while (subIdx >= 0 && dataArray[subIdx] > currentValue) {
      dataArray[subIdx + gapSize] = dataArray[subIdx]; // Shift element
      subIdx = subIdx - gapSize; // Move to the previous element in the sub-array
      operationCount++; // Increment the comparison counter
    }
    dataArray[subIdx + gapSize] = currentValue; // Place currentValue in its correct position
  }
}

/**
 * Generates a sequence of decreasing gap sizes for Shell Sort using Knuth's formula (h = h * 3 + 1).
 * @param {number[]} dataArray - The array for which to generate gap sizes (its length determines the max gap).
 * @returns {number[]} An array of gap sizes in descending order.
 */
function generateGaps(dataArray) {
  const arrayLength = dataArray.length; // Get the total number of elements
  let previousGap = 1; // Start with the initial gap of 1
  const gapSequence = [1]; // Initialize the sequence with 1

  // Generate gaps until the next gap exceeds the array length
  while (true) {
    previousGap = previousGap * 3 + 1; // Apply Knuth's formula
    if (previousGap < arrayLength) {
      gapSequence.push(previousGap); // Add the new gap if it's within bounds
    } else {
      break; // Stop if the gap is too large
    }
  }
  return gapSequence.reverse(); // Return the gaps in descending order
}

/**
 * Implements the Shell Sort algorithm using the generated gap sequence.
 * @param {number[]} dataArray - The array to be sorted.
 * @returns {number[]} The sequence of gaps used during the sort.
 */
function sortWithShell(dataArray) {
  operationCount = 0; // Reset the comparison counter for this sort operation
  const gapList = generateGaps(dataArray); // Obtain the sequence of gaps

  // Apply insertion sort for each gap in the sequence
  for (let idx = 0; idx < gapList.length; idx++) {
    subArraySort(dataArray, gapList[idx]); // Perform g-sorted insertion sort
  }
  return gapList; // Return the list of gaps used
}

// Event listener for when the input stream closes
inputProcessor.on("close", () => {
  // The first line contains the number of elements
  const elementCount = inputBuffer[0] - 0;
  // The subsequent lines contain the array elements, converted to numbers
  const dataArray = inputBuffer.slice(1, elementCount + 1).map(Number);

  // Perform the Shell Sort on the array
  const gapList = sortWithShell(dataArray);

  // Output the results as specified
  console.log(gapList.length); // Number of gaps used
  console.log(gapList.join(" ")); // The gap sequence, space-separated
  console.log(operationCount); // Total comparison operations
  dataArray.forEach((item) => console.log(item)); // Each sorted element on a new line
});
