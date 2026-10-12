'use strict';

// This function processes the raw input string to perform matrix multiplication.
const processInput = (rawData) => {
  // Trim leading/trailing whitespace and split the input into individual lines.
  let parsedLines = rawData.trim().split('\n');

  // Parse the first line to get matrix dimensions (rowsA, commonDim, colsB).
  let dimensions = parsedLines[0].split(' ').map(textVal => parseInt(textVal, 10));

  // Extract and parse the first matrix (matrix A) from the input lines.
  // It spans from the second line up to (dimensions[0] + 1) lines.
  const firstMatrix = parsedLines.slice(1, dimensions[0] + 1).map(lineContent =>
    lineContent.split(' ').map(textVal => parseInt(textVal, 10))
  );

  // Extract and parse the second matrix (matrix B) from the input lines.
  // It starts after matrix A and spans for dimensions[1] lines.
  const secondMatrix = parsedLines.slice(dimensions[0] + 1, dimensions[0] + 1 + dimensions[1]).map(lineContent =>
    lineContent.split(' ').map(textVal => parseInt(textVal, 10))
  );

  // Initialize the product matrix with zeros.
  // The product matrix will have dimensions[0] rows and dimensions[2] columns.
  const productMatrix = [...Array(dimensions[0])].map(_rowPlaceholder =>
    [...Array(dimensions[2])].map(_colPlaceholder => 0)
  );

  // Perform matrix multiplication.
  // Iterate through rows of the first matrix (matrix A).
  for (let rowIndex = 0; rowIndex < dimensions[0]; rowIndex++) {
    // Iterate through columns of the second matrix (matrix B).
    for (let colIndex = 0; colIndex < dimensions[2]; colIndex++) {
      // Temporary array to store products for the current cell.
      let currentProducts = [];
      // Iterate through the common dimension (columns of A / rows of B).
      for (let commonIndex = 0; commonIndex < dimensions[1]; commonIndex++) {
        // Multiply corresponding elements and add to the temporary array.
        currentProducts.push(firstMatrix[rowIndex][commonIndex] * secondMatrix[commonIndex][colIndex]);
      }
      // Sum the products to get the value for the current cell in the product matrix.
      productMatrix[rowIndex][colIndex] = currentProducts.reduce((accumulator, currentValue) => accumulator + currentValue);
    }
  }

  // Format the resulting matrix for output:
  // Each row's elements are joined by a space, and rows are joined by a newline.
  console.log(productMatrix.map(outputRow => outputRow.join(' ')).join('\n'));
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
