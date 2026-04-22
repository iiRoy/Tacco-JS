function processInputData(rawDataString) {
  // Validate raw input string presence
  if (!rawDataString || typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
    console.error("Error: Invalid or empty input data provided.");
    return;
  }

  // Split the input into individual lines, handling different line endings and trimming overall whitespace
  const allInputLines = rawDataString.trim().split(/\r?\n/);

  // Ensure there's at least one line for dimensions
  if (allInputLines.length === 0) {
    console.error("Error: Input data contains no lines after trimming.");
    return;
  }

  // Extract the first line which contains the matrix dimensions (height and width)
  const dimensionSpecifier = allInputLines.shift();

  // Parse the height and width from the dimension line
  const dimensions = dimensionSpecifier.split(' ').map(Number);

  // Validate the parsed dimensions
  if (dimensions.length !== 2 || isNaN(dimensions[0]) || isNaN(dimensions[1]) || dimensions[0] <= 0 || dimensions[1] <= 0) {
    console.error("Error: Invalid matrix dimensions specified. Expected two positive integers.");
    return;
  }

  const matrixHeight = dimensions[0]; // Number of rows for the input matrix
  const matrixWidth = dimensions[1];  // Number of columns for the input matrix

  // Check if enough lines remain for the matrix itself
  if (allInputLines.length < matrixHeight) {
    console.error(`Error: Not enough lines for a matrix of height ${matrixHeight}. Only ${allInputLines.length} lines available.`);
    return;
  }

  // Extract the matrix rows from the input lines
  // These lines are then converted into arrays of numbers
  const inputMatrixRows = [];
  for (let rIdx = 0; rIdx < matrixHeight; rIdx++) {
    const currentRowTokens = allInputLines[rIdx].split(' ').map(Number);
    // Optional: Validate row length
    if (currentRowTokens.length !== matrixWidth) {
        console.warn(`Warning: Row ${rIdx} has ${currentRowTokens.length} elements, expected ${matrixWidth}. Padding with zeros or truncating if necessary.`);
        // For Type III, we can make a choice here. Let's pad with 0s or truncate.
        if (currentRowTokens.length < matrixWidth) {
            while (currentRowTokens.length < matrixWidth) currentRowTokens.push(0);
        } else if (currentRowTokens.length > matrixWidth) {
            currentRowTokens.splice(matrixWidth);
        }
    }
    inputMatrixRows.push(currentRowTokens);
  }

  // Determine the starting index for coefficients based on how many matrix rows were consumed
  const remainingLinesForCoefficients = allInputLines.slice(matrixHeight);

  // Parse the coefficient vector from the remaining lines
  const coefficientVector = remainingLinesForCoefficients.map(val => {
    const parsedVal = Number(val);
    if (isNaN(parsedVal)) {
        console.warn(`Warning: Coefficient value '${val}' is not a valid number. Using 0 for calculation.`);
        return 0; // Default to 0 for invalid coefficients
    }
    return parsedVal;
  });

  // Validate the coefficient vector's length against the matrix width
  if (coefficientVector.length !== matrixWidth) {
    console.error(`Error: Coefficient vector length (${coefficientVector.length}) does not match matrix width (${matrixWidth}).`);
    return;
  }

  // Helper function to compute the dot product of a row with the coefficient vector
  const computeRowProduct = (rowToProcess, coefficients) => {
    let currentSumOfProducts = 0; // Initialize sum for the current row
    // Iterate through the elements of the row and coefficients
    for (let colIdx = 0; colIdx < matrixWidth; colIdx++) {
      const matrixValue = rowToProcess[colIdx];
      const coeffValue = coefficients[colIdx];

      // Robustness check: Ensure values are numbers before multiplication
      if (typeof matrixValue === 'number' && !isNaN(matrixValue) &&
          typeof coeffValue === 'number' && !isNaN(coeffValue)) {
        currentSumOfProducts += matrixValue * coeffValue;
      } else {
        // Log a warning if non-numeric values are encountered
        console.warn(`Warning: Non-numeric value encountered at matrix[${colIdx}] or coefficient[${colIdx}] in row. Skipping multiplication for this element.`);
        // This effectively treats non-numeric values as 0 in the sum.
      }
    }
    return currentSumOfProducts;
  };

  // Perform the calculation for each row of the input matrix
  inputMatrixRows.forEach((currentRow, rowIterationIndex) => {
    // Calculate the product sum for the current row
    const resultForCurrentRow = computeRowProduct(currentRow, coefficientVector);
    // Output the computed result
    console.log(resultForCurrentRow);
  });
}

// --- Main execution block for reading from standard input ---
try {
  // Require the 'fs' (file system) module to read input
  const fileSystemModule = require('fs');
  
  // Read the entire content from standard input synchronously
  // The 'utf-8' encoding is specified for proper character handling
  const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf-8');

  // Call the main processing function with the obtained input
  processInputData(standardInputContent);
} catch (ioError) {
  // Catch and report any errors that occur during file reading
  console.error("An error occurred while reading from standard input:", ioError.message);
  // Optionally, exit the process with an error code to indicate failure
  process.exit(1);
}