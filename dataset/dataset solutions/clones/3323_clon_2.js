'use strict' // Enforces stricter parsing and error handling for the entire script.

function computeResult(itemCount, eventChances) {
  // Initialize a dynamic programming grid (2D array) with zeros.
  // The dimensions are (itemCount + 1) x (itemCount + 1) to accommodate 0-based indexing up to itemCount.
  var dynProgGrid = new Array(itemCount + 1).fill(0).map(arrayEntry => new Array(itemCount + 1).fill(0));

  // Iterate through each row of the dynamic programming grid.
  for (var rowIndex = 0; rowIndex < dynProgGrid.length; rowIndex++) {
    // Iterate through each column within the current row.
    for (var columnIndex = 0; columnIndex < dynProgGrid[rowIndex].length; columnIndex++) {
      // Base case: The very first cell (0,0) is initialized to 1, representing the start of a process.
      if (rowIndex === 0 && columnIndex === 0) {
        dynProgGrid[rowIndex][columnIndex] = 1;
        continue; // Skip to the next iteration after setting the base value.
      }

      // If the column index is greater than the row index, this state is impossible, so probability is 0.
      if (columnIndex > rowIndex) {
        dynProgGrid[rowIndex][columnIndex] = 0;
      }
      // If the column index equals the row index, the probability depends on a previous diagonal element.
      else if (columnIndex === rowIndex) {
        dynProgGrid[rowIndex][columnIndex] = eventChances[rowIndex - 1] * dynProgGrid[rowIndex - 1][columnIndex - 1];
      }
      // If the column index is less than the row index, a more complex calculation is needed.
      else if (columnIndex < rowIndex) {
        // Special case for the first column (columnIndex 0).
        if (columnIndex === 0) {
          dynProgGrid[rowIndex][columnIndex] = (1 - eventChances[rowIndex - 1]) * dynProgGrid[rowIndex - 1][columnIndex];
        }
        // General case: Probability is a sum of two scenarios from the previous row.
        // One scenario involves the event happening (from diagonal), the other involves it not happening (from direct above).
        else {
          dynProgGrid[rowIndex][columnIndex] = eventChances[rowIndex - 1] * dynProgGrid[rowIndex - 1][columnIndex - 1] + (1 - eventChances[rowIndex - 1]) * dynProgGrid[rowIndex - 1][columnIndex];
        }
      }
    }
  }

  // Calculate the starting index for summing the final probabilities.
  // This usually corresponds to a threshold, like "at least half" of the items.
  var resultAccumulationPoint = parseInt(itemCount / 2) + 1;
  var totalProbability = 0; // Initialize a variable to accumulate the final sum.

  // Sum up the probabilities from the last row of the DP grid, starting from the calculated threshold.
  for (var summationIndex = resultAccumulationPoint; summationIndex < dynProgGrid[itemCount].length; summationIndex++) {
    totalProbability += dynProgGrid[itemCount][summationIndex];
  }
  return totalProbability; // Return the final aggregated probability.
}

function processInputData(programInput) {
  // Split the raw input string into an array of lines based on newline characters.
  var dataRows = programInput.split("\n");

  // Parse the first line of input to get the total number of items, converting it to an integer.
  var itemCount = parseInt(dataRows[0]);

  // Parse the second line: split by space, then map each part to a floating-point number.
  var eventChances = dataRows[1].split(' ').map(probabilityString => parseFloat(probabilityString));

  // Call the core computation function with the parsed item count and probabilities.
  var computedValue = computeResult(itemCount, eventChances);

  // Output the final calculated value to the standard console.
  console.log(computedValue);
}

// Read input from the standard input stream (e.g., from a pipe or file).
// The input is read as UTF-8 encoded text.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));