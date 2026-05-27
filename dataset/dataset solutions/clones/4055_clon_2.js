var ProcessInput = function(rawData) {
  // Split the entire input string into individual lines
  var inputLines = rawData.split('\n');

  // The first line contains the number of elements, N
  var elementCount = inputLines[0];

  // The second line contains space-separated values for the first row
  var rowOneStrings = inputLines[1].split(' ');

  // The third line contains space-separated values for the second row
  var rowTwoStrings = inputLines[2].split(' ');

  // Initialize a 2D array to store parsed integer data
  var numericData = new Array();
  numericData[0] = new Array();
  numericData[1] = new Array();

  // Populate the 2D array by parsing string values to integers
  for (var rowIdx = 0; rowIdx < 2; rowIdx++) {
    for (var colIdx = 0; colIdx < elementCount; colIdx++) {
      if (rowIdx === 0) {
        numericData[rowIdx][colIdx] = parseInt(rowOneStrings[colIdx]);
      } else if (rowIdx === 1) {
        numericData[rowIdx][colIdx] = parseInt(rowTwoStrings[colIdx]);
      }
    }
  }

  // Variable to keep track of the maximum sum found
  var highestSum = 0;

  // Iterate through all possible split points for the two rows
  for (var splitPoint = 0; splitPoint <= elementCount - 1; splitPoint++) {
    var currentIterationSum = 0;

    // Sum elements from the first row up to the split point
    for (var firstRowElement = 0; firstRowElement <= elementCount - 1 - splitPoint; firstRowElement++) {
      currentIterationSum += numericData[0][firstRowElement];
    }

    // Sum elements from the second row starting from the split point
    for (var secondRowElement = elementCount - 1 - splitPoint; secondRowElement <= elementCount - 1; secondRowElement++) {
      currentIterationSum += numericData[1][secondRowElement];
    }

    // Update the highest sum if the current sum is greater
    if (currentIterationSum > highestSum) {
      highestSum = currentIterationSum;
    }
  }

  // Output the final maximum sum
  console.log('%d', highestSum);
};

// This part handles reading input and calling the main processing function.
// Do not modify the code below this line.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
