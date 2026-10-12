var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The following line overrides the standard input for this specific problem instance.
sourceData = '2 4\n...*\n.*..\n0 0';

// Split the entire input string into an array of individual lines,
// after removing any leading/trailing whitespace from the whole input.
var lineSegments = sourceData.trim().split("\n");

// Main processing loop: continues until a "0 0" dimension pair is encountered.
while (true) {
  // Extract the dimensions (height and width) from the first line segment.
  // Convert the string parts to numbers.
  var dimensions = lineSegments.shift().split(" ").map(Number);

  // Check for the termination condition: "0 0".
  if (dimensions.join(" ") === "0 0") {
    break; // Exit the loop if dimensions are 0 0.
  }

  // Assign height and width to more descriptive variables.
  var rowsCount = dimensions[0];
  var colsCount = dimensions[1];

  // Initialize a 2D array to store the heights of consecutive '.' characters.
  // This matrix will be used to represent histograms for each row.
  var heightMatrix = [];

  // Populate the height matrix based on the input grid.
  for (var rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
    // Get the current row of characters from the input.
    var currentRowChars = lineSegments.shift().split("");
    heightMatrix[rowIndex] = []; // Initialize the current row in the matrix.

    // Iterate through each character in the current row.
    currentRowChars.forEach(function (charValue, colIndex) {
      // If it's the first row:
      if (rowIndex === 0) {
        // If the character is '.', height is 1.
        if (charValue === ".") {
          heightMatrix[rowIndex][colIndex] = 1;
        }
        // If it's not '.', height is 0.
        else {
          heightMatrix[rowIndex][colIndex] = 0;
        }
      }
      // If it's not the first row:
      else {
        // If the character is '.', height is 1 plus the height from the cell directly above.
        if (charValue === ".") {
          heightMatrix[rowIndex][colIndex] = heightMatrix[rowIndex - 1][colIndex] + 1;
        }
        // If it's not '.', height is 0.
        else {
          heightMatrix[rowIndex][colIndex] = 0;
        }
      }
    });
  }

  // Initialize the maximum area found so far to zero.
  var maximumArea = 0;

  // Iterate through each row of the height matrix to find the largest rectangle.
  // This uses a stack-based approach for finding the largest rectangle in a histogram.
  for (var currentMatrixRow = 0; currentMatrixRow < rowsCount; currentMatrixRow++) {
    // Initialize an empty stack for the current row's histogram processing.
    var heightStack = [];
    // Add a sentinel value (0) at the end of the current row's histogram.
    // This ensures all elements in the stack are processed.
    heightMatrix[currentMatrixRow][colsCount] = 0;

    // Iterate through each column (including the sentinel) of the current row.
    for (var currentCol = 0; currentCol <= colsCount; currentCol++) {
      var currentHeight = heightMatrix[currentMatrixRow][currentCol];
      var lastPoppedIndex = currentCol; // Keep track of the starting index for new rectangles.

      // If the stack is empty, push the current height and its index.
      if (heightStack.length === 0) {
        heightStack.push([currentHeight, currentCol]);
        continue;
      }

      // If the current height is greater than the height at the top of the stack, push it.
      if (heightStack[heightStack.length - 1][0] < currentHeight) {
        heightStack.push([currentHeight, currentCol]);
      }
      // If the current height is equal to the height at the top of the stack, do nothing (skip).
      else if (heightStack[heightStack.length - 1][0] === currentHeight) {
        continue;
      }
      // If the current height is less than the height at the top of the stack,
      // pop elements from the stack and calculate areas.
      else if (heightStack[heightStack.length - 1][0] > currentHeight) {
        while (true) {
          // If the stack becomes empty, push the current height with the last popped index.
          if (heightStack.length === 0) {
            heightStack.push([currentHeight, lastPoppedIndex]);
            break;
          }

          var poppedElement = heightStack.pop(); // Pop an element from the stack.

          // If the current height is greater than the popped height,
          // push the current height with the last popped index and break.
          if (currentHeight > poppedElement[0]) {
            heightStack.push([currentHeight, lastPoppedIndex]);
            break;
          }

          // Update the last popped index to the index of the popped element.
          lastPoppedIndex = poppedElement[1];

          // If the current height is equal to the popped height, break.
          if (currentHeight === poppedElement[0]) {
            break;
          }
          // If the current height is less than or equal to the popped height,
          // calculate the area using the popped height and update maximumArea.
          else if (currentHeight <= poppedElement[0]) {
            maximumArea = Math.max(maximumArea, poppedElement[0] * (currentCol - poppedElement[1]));
          }
        }
      }
    }
  }
  // Output the maximum area found for the current grid.
  console.log(maximumArea);
}
