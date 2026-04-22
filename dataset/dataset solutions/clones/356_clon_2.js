const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

let lineBuffer = dataSource
  .trim()
  .split("\n");

// Process multiple test cases from the input stream.
while (true) {
  // Read the dimensions (height and width) for the current grid.
  // The line is split by space and each part converted to a number.
  const dims = lineBuffer
    .shift()
    .split(" ")
    .map(Number);

  // Check for the termination condition: "0 0" indicates end of input.
  if (dims.join(" ") === "0 0") {
    break;
  }

  // Extract the height and width values.
  const heightVal = dims[0];
  const widthVal = dims[1];

  // Initialize a 2D array to store the calculated heights of consecutive '.' characters.
  // This array effectively transforms the grid into a series of histograms.
  const gridHeights = [];

  // Iterate through each row of the input grid data.
  for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    // Get the character array for the current row.
    const currentLineChars = lineBuffer
      .shift()
      .split("");

    // Initialize the sub-array for the current row in gridHeights.
    gridHeights[rowIdx] = [];

    // Process each character in the current row.
    currentLineChars.forEach(function(charSymbol, colIdx) {
      // Determine the height based on the character and previous row's value.
      if (rowIdx === 0) {
        // For the first row, a '.' is height 1, anything else is height 0.
        if (charSymbol === ".") {
          gridHeights[rowIdx][colIdx] = 1;
        } else {
          gridHeights[rowIdx][colIdx] = 0;
        }
      } else {
        // For subsequent rows, if it's '.', its height is one more than the cell directly above.
        // Otherwise, it's 0.
        if (charSymbol === ".") {
          gridHeights[rowIdx][colIdx] = gridHeights[rowIdx - 1][colIdx] + 1;
        } else {
          gridHeights[rowIdx][colIdx] = 0;
        }
      }
    });
  }

  // Variable to store the maximum rectangular area found across all rows.
  let greatestArea = 0;

  // Iterate through each row of gridHeights, treating each row as a histogram.
  for (let currentRow = 0; currentRow < heightVal; currentRow++) {
    // Initialize a stack to help find the largest rectangle in the current histogram row.
    const histogramStack = [];
    // Add a sentinel bar of height 0 at the end of the current row's histogram.
    // This ensures all bars remaining in the stack are processed.
    gridHeights[currentRow][widthVal] = 0;

    // Iterate through each bar (column) in the current histogram row.
    for (let currentCol = 0; currentCol <= widthVal; currentCol++) {
      const currentHeight = gridHeights[currentRow][currentCol];

      // If the stack is empty, push the current bar's height and its effective starting index.
      if (histogramStack.length === 0) {
        histogramStack.push([currentHeight, currentCol + 1]);
        continue;
      }

      // If the current bar is taller than the bar at the top of the stack, push it.
      if (histogramStack[histogramStack.length - 1][0] < currentHeight) {
        histogramStack.push([currentHeight, currentCol]);
      }
      // If the current bar is the same height, it effectively extends the top bar; do nothing.
      else if (histogramStack[histogramStack.length - 1][0] === currentHeight) {
        continue;
      }
      // If the current bar is shorter than the bar at the top of the stack,
      // pop bars until a shorter or equal bar is found.
      else if (histogramStack[histogramStack.length - 1][0] > currentHeight) {
        while (histogramStack.length !== 0) {
          const poppedBar = histogramStack.pop(); // Remove the top bar from the stack.

          // If the current height is greater than the popped bar's height,
          // push the popped bar back and stop processing for this 'currentHeight'.
          if (currentHeight > poppedBar[0]) {
            histogramStack.push(poppedBar);
            break;
          }
          // If the current height is equal to the popped bar's height, stop processing.
          else if (currentHeight === poppedBar[0]) {
            break;
          }
          // If the current height is less than the popped bar's height,
          // calculate the area for the popped bar and update the maximum area.
          else if (currentHeight < poppedBar[0]) {
            // Area is (popped bar's height) * (current column index + 1 - popped bar's starting index).
            greatestArea = Math.max(greatestArea, poppedBar[0] * ((currentCol + 1) - poppedBar[1]));
          }
        }
      }
    }
  }
  // Print the largest area found for the current test case.
  console.log(greatestArea);
}