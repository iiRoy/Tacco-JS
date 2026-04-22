let totalSwapsMade; // Global counter to track the total number of element movements during sorting

/**
 * Performs a gap-based insertion sort on a sublist of the main array.
 * This is a core component of the Shell Sort algorithm.
 * @param {Array<number>} dataList - The array of numbers to be sorted.
 * @param {number} listSize - The total number of elements in the dataList.
 * @param {number} currentGapValue - The current gap (or stride) for this pass of insertion sort.
 */
function performGapInsertionSort(dataList, listSize, currentGapValue) {
  // Iterate through the array starting from the current gap value.
  // Each 'primaryIndex' represents the element to be inserted into its sorted sublist.
  for (let primaryIndex = currentGapValue; primaryIndex < listSize; primaryIndex++) {
    const valueToInsert = dataList[primaryIndex]; // Store the current element to be inserted.
    let comparisonIndex = primaryIndex - currentGapValue; // Initialize the comparison pointer for backward traversal.

    // Shift elements in the sorted sublist that are greater than 'valueToInsert'
    // to create space for 'valueToInsert'.
    while (comparisonIndex >= 0 && dataList[comparisonIndex] > valueToInsert) {
      dataList[comparisonIndex + currentGapValue] = dataList[comparisonIndex]; // Move the larger element forward.
      comparisonIndex -= currentGapValue; // Move the comparison pointer backward by the gap.
      totalSwapsMade++; // Increment the global counter for each element shift.
    }
    // Place 'valueToInsert' into its correct sorted position within the sublist.
    dataList[comparisonIndex + currentGapValue] = valueToInsert;
  }
} // End of performGapInsertionSort function

/**
 * Implements the Shell Sort algorithm to sort an array of numbers.
 * It uses a sequence of decreasing gaps to perform multiple passes of
 * gap-based insertion sorts.
 * @param {Array<number>} dataCollection - The array of numbers to be sorted.
 * @param {number} collectionLength - The total number of elements in the dataCollection.
 */
function executeShellSort(dataCollection, collectionLength) {
  totalSwapsMade = 0; // Reset the global swap counter at the start of a new sort.

  const gapSequenceList = []; // Array to hold the calculated gap sequence.

  // Generate a decreasing sequence of gaps using the (2^k - 1) formula.
  // This sequence is often referred to as Knuth's sequence or a similar variant.
  for (let sequenceIndex = 1; Math.pow(2, sequenceIndex) - 1 <= collectionLength; sequenceIndex++) {
    gapSequenceList.push(Math.pow(2, sequenceIndex) - 1); // Add the calculated gap to the list.
  }
  gapSequenceList.reverse(); // Reverse the sequence to ensure gaps are in decreasing order.
  const numberOfGaps = gapSequenceList.length; // Get the total count of gaps generated.

  // Apply the gap insertion sort for each gap in the generated sequence.
  // This progressively sorts the array, moving towards a fully sorted state.
  for (let gapIndex = 0; gapIndex < numberOfGaps; gapIndex++) {
    performGapInsertionSort(dataCollection, collectionLength, gapSequenceList[gapIndex]); // Sort using the current gap.
  }

  // Output the sorting statistics and the final sorted array.
  console.log(numberOfGaps); // Print the number of gaps used.
  console.log(gapSequenceList.join(' ')); // Print the gap sequence, space-separated.
  console.log(totalSwapsMade); // Print the total number of element movements.

  // Print each element of the sorted array on a new line.
  for (let elementIndex = 0; elementIndex < collectionLength; elementIndex++) {
    console.log(dataCollection[elementIndex]);
  }
} // End of executeShellSort function

// --- Main execution block for reading input and initiating sort ---

// Read all input from standard input as a single string.
const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input string into an array of individual lines.
let dataLines = fileContents.split('\n');

// The first line of input is typically the size of the array (n).
// Extract this value and store it.
const listLengthValue = dataLines.shift();

// Convert the remaining lines (which are string representations of numbers)
// into actual numeric values. The 'i - 0' is a common JavaScript idiom for type coercion.
dataLines = dataLines.map(function(lineItem) { return lineItem - 0; });

// Execute the Shell Sort algorithm with the parsed numeric data and its length.
executeShellSort(dataLines, listLengthValue);