(function (rawData) {
  // This function processes the input data.
  var linesArray = rawData.split('\n');
  var elementCount = linesArray.shift(); // Get the number of elements
  var numericData = linesArray.shift().split(' ', elementCount).map(Number);

  // Call the sorting routine
  performBubbleSort(numericData);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

/**
 * Executes a bubble sort algorithm on the provided array.
 * @param {Array<number>} numericData - The array of numbers to be sorted.
 */
function performBubbleSort(numericData) {
  var swapOperations = 0; // Counter for the number of swaps
  var hasSwapped = true; // Flag to track if any swaps occurred in a pass

  while (hasSwapped) {
    hasSwapped = false; // Assume no swaps in this pass
    for (var idx = numericData.length - 1; idx >= 1; idx--) {
      // Compare adjacent elements
      if (numericData[idx] < numericData[idx - 1]) {
        // Swap elements if they are in the wrong order
        var temporaryValue = numericData[idx];
        numericData[idx] = numericData[idx - 1];
        numericData[idx - 1] = temporaryValue;
        hasSwapped = true; // A swap occurred, so another pass is needed
        swapOperations++; // Increment swap counter
      }
    }
  }

  // Output the sorted array and the total swap count
  console.log(numericData.join(' '));
  console.log(swapOperations);
}
