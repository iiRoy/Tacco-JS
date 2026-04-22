'use strict'; // Enforce strict parsing and error handling rules

// Main function to process the input and perform matrix multiplication
const processInputData = sourceContent => {
  // Parse the raw input string into an array of lines
  var dataLines = sourceContent.trim().split("\n");

  // Extract matrix dimensions from the first line
  // The dimensions are usually in the format "R1 C1 C2" where R1 is rows of matrix A,
  // C1 is columns of A (and rows of B), and C2 is columns of B.
  var matrixSpecs = dataLines[0].split(" ").map(valueString => parseInt(valueString, 10));

  // Extract the first matrix (operand A) from subsequent lines
  // It spans from the second line up to (R1 + 1) lines.
  const firstOperandMatrix = dataLines.slice(1, matrixSpecs[0] + 1).map(matrixRowString =>
    matrixRowString.split(" ").map(valueString => parseInt(valueString, 10))
  );

  // Extract the second matrix (operand B)
  // It spans from (R1 + 1) up to (R1 + 1 + C1) lines.
  const secondOperandMatrix = dataLines.slice(matrixSpecs[0] + 1, matrixSpecs[0] + 1 + matrixSpecs[1]).map(matrixRowString =>
    matrixRowString.split(" ").map(valueString => parseInt(valueString, 10))
  );

  // Initialize the result matrix with zeros.
  // Its dimensions will be R1 x C2.
  const productGrid = [...Array(matrixSpecs[0])].map(_ =>
    [...Array(matrixSpecs[2])].map(__ => 0)
  );

  // This variable is declared but immediately shadowed in the inner loop.
  // It serves no functional purpose here due to the shadowing.
  var unnecessaryArray = [];

  // Perform matrix multiplication
  // Iterate through rows of the first matrix (A)
  for (var rowIndexA = 0; rowIndexA < matrixSpecs[0]; rowIndexA++) {
    // Iterate through columns of the second matrix (B)
    for (var colIndexB = 0; colIndexB < matrixSpecs[2]; colIndexB++) {
      // Array to store intermediate products for the current cell (rowIndexA, colIndexB)
      var intermediateProducts = [];

      // Iterate through the common dimension (columns of A / rows of B)
      for (var sharedDimIndex = 0; sharedDimIndex < matrixSpecs[1]; sharedDimIndex++) {
        // Calculate the product of corresponding elements and add to the temporary array
        intermediateProducts.push(firstOperandMatrix[rowIndexA][sharedDimIndex] * secondOperandMatrix[sharedDimIndex][colIndexB]);
      }
      // Sum all intermediate products to get the final value for the current cell
      productGrid[rowIndexA][colIndexB] = intermediateProducts.reduce((sumAccumulator, nextTermValue) => sumAccumulator + nextTermValue);
    }
  }

  // Format the final product matrix for output: rows joined by space, rows by newline
  console.log(
    productGrid.map(processedRow => processedRow.join(" ")).join("\n")
  );
};

// Read input from standard input and pass it to the processing function
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));