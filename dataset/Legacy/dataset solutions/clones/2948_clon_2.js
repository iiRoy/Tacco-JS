function ProcessInput(rawData) {
  // Split the raw input string into individual lines.
  let processedLines = rawData.split("\n");

  // Remove the last line if it's empty, which often happens with trailing newlines.
  if (processedLines[processedLines.length - 1] === '') {
    processedLines.pop();
  }

  // The first line contains parameters, but only the first part is extracted.
  // This variable is declared but not used in the original logic.
  const firstLineParam = processedLines[0].split(' ')[0];

  // Initialize a variable to accumulate the total cost.
  let totalCost = 0;

  // This array will store numerical values in sorted order.
  let sortedValues = [];

  // Declare variables used for binary search and array manipulation.
  let insertionIndex, lowerBound, upperBound, middleIndex;

  // Declare a temporary variable to hold parsed data for each operation.
  let currentOperationData;

  // Iterate through the input lines, starting from the second line (index 1).
  for (let lineIterator = 1; lineIterator < processedLines.length; lineIterator++) {
    // Check if the current operation is a query (represented by "2").
    if (processedLines[lineIterator] === '2') {
      // For a query, print the median value and the current total cost.
      // Math.ceil(sortedValues.length / 2) - 1 correctly identifies the lower median for even length arrays
      // and the single median for odd length arrays.
      console.log(sortedValues[Math.ceil(sortedValues.length / 2) - 1], totalCost);
    } else {
      // This block handles insertion operations.
      // Parse the current line: split by space, take elements from the second one, and convert to numbers.
      currentOperationData = processedLines[lineIterator].split(' ').slice(1).map(elementString => {
        return elementString - 0; // Convert string to number.
      });

      // Special case: if the sortedValues array is empty, just add the first value.
      if (sortedValues.length === 0) {
        sortedValues = [currentOperationData[0]];
        totalCost += currentOperationData[1]; // Add the second value to the total cost.
        continue; // Move to the next line.
      }

      // Determine the insertion point for the new value (currentOperationData[0])
      // If the new value is greater than the last element, insert at the end.
      if (sortedValues[sortedValues.length - 1] < currentOperationData[0]) {
        insertionIndex = sortedValues.length;
      }
      // If the new value is less than or equal to the first element, insert at the beginning.
      else if (sortedValues[0] >= currentOperationData[0]) {
        insertionIndex = 0;
      }
      // Otherwise, use binary search to find the correct insertion point to maintain sorted order.
      else {
        upperBound = sortedValues.length - 1;
        lowerBound = 0;
        while (upperBound - lowerBound > 1) {
          middleIndex = Math.floor((upperBound + lowerBound) / 2);
          if (sortedValues[middleIndex] < currentOperationData[0]) {
            lowerBound = middleIndex;
          } else {
            upperBound = middleIndex;
          }
        }
        insertionIndex = lowerBound + 1;
      }

      // Adjust the total cost based on the median and the new value before insertion.
      // This logic ensures the cost reflects the change in median.
      if (sortedValues.length % 2 === 0) { // If the array currently has an even number of elements
        if (insertionIndex > sortedValues.length / 2) {
          totalCost += currentOperationData[0] - sortedValues[sortedValues.length / 2];
        } else if (insertionIndex < sortedValues.length / 2) {
          totalCost += sortedValues[sortedValues.length / 2 - 1] - currentOperationData[0];
        }
      } else { // If the array currently has an odd number of elements
        totalCost += Math.abs(currentOperationData[0] - sortedValues[(sortedValues.length - 1) / 2]);
      }

      // Insert the new value into the sorted array at the determined index.
      sortedValues.splice(insertionIndex, 0, currentOperationData[0]);

      // Add the second value from the input line to the total cost.
      totalCost += currentOperationData[1];
    }
  }
}

// This line handles reading input from standard input and calling the main processing function.
// It should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
