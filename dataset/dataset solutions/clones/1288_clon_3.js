// This JavaScript module is designed to process structured input data
// to perform a fundamental linear algebra operation: matrix-vector multiplication.
// It reads matrix dimensions, matrix elements, and vector elements from standard input,
// then calculates the dot product of each matrix row with the input vector,
// outputting each resulting scalar.
function processMatrixVectorOperation(rawInputData) {

  // --- Input Data Pre-processing and Validation ---

  // Initial check for the validity of the raw input.
  // Ensures that the input is a non-empty string before proceeding.
  if (typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
    console.error("Operation Error: Input data is either empty, null, or not a string. Cannot proceed.");
    return; // Exit if input is invalid.
  }

  // Clean the input by removing any leading or trailing whitespace,
  // then segment it into individual lines based on newline characters.
  const normalizedInputContent = rawInputData.trim();
  const segmentedInputLines = normalizedInputContent.split("\n");

  // Verify that there are enough lines to even read the dimensions.
  if (segmentedInputLines.length < 1) {
    console.error("Operation Error: No discernible lines of data found after normalization. Aborting.");
    return;
  }

  // --- Parsing Dimensions (N and M) ---

  // The first line of input is expected to contain two space-separated integers:
  // N (number of rows in the matrix) and M (number of columns in the matrix, also the vector's dimension).
  const dimensionSpecifiers = segmentedInputLines[0].split(" ");

  // Validate the format of the dimension line. It must contain exactly two numbers.
  if (dimensionSpecifiers.length !== 2) {
    console.error("Parsing Error: The first line (dimensions) is malformed. Expected 'N M', but found different format.");
    return;
  }

  // Convert the string representations of N and M into integer values.
  const matrixRowCount = parseInt(dimensionSpecifiers[0], 10);
  const vectorDimension = parseInt(dimensionSpecifiers[1], 10);

  // Validate that the parsed dimensions are positive integers.
  if (isNaN(matrixRowCount) || matrixRowCount <= 0 || isNaN(vectorDimension) || vectorDimension <= 0) {
    console.error(`Validation Error: Invalid matrixRowCount (${matrixRowCount}) or vectorDimension (${vectorDimension}). Both must be positive integers.`);
    return;
  }

  // --- Overall Input Line Count Validation ---

  // Calculate the total number of lines expected: 1 (for dimensions) + N (for matrix rows) + M (for vector elements).
  const minimumRequiredLines = 1 + matrixRowCount + vectorDimension;
  if (segmentedInputLines.length < minimumRequiredLines) {
    console.error(`Validation Error: Insufficient input lines. Expected at least ${minimumRequiredLines} lines, but received ${segmentedInputLines.length}.`);
    return;
  }

  // --- Parsing Matrix A ---

  // Initialize an empty array to store the matrix.
  // Each element of this array will be another array representing a row of the matrix.
  const inputMatrixA = [];

  // Iterate through the lines following the dimension line to populate the matrix.
  // The matrix rows start from the second line (index 1) of the input.
  for (let rowIndex = 0; rowIndex < matrixRowCount; ++rowIndex) {
    const currentMatrixLine = segmentedInputLines[rowIndex + 1];
    const stringElementsOfRow = currentMatrixLine.split(" ");

    // Validate that each row has the expected number of columns (vectorDimension).
    if (stringElementsOfRow.length !== vectorDimension) {
      console.error(`Data Integrity Error: Row ${rowIndex + 1} of the matrix has ${stringElementsOfRow.length} elements, but ${vectorDimension} were expected.`);
      return;
    }

    // Convert string elements of the current row into numbers.
    const numericalRow = stringElementsOfRow.map(strVal => {
      const parsedNum = parseInt(strVal, 10);
      if (isNaN(parsedNum)) {
        console.error(`Parsing Error: Non-numeric value '${strVal}' encountered in matrix row ${rowIndex + 1}.`);
        // In a production system, more sophisticated error handling or default value assignment might occur.
      }
      return parsedNum;
    });
    inputMatrixA.push(numericalRow);
  }

  // --- Parsing Vector B ---

  // Initialize an empty array to store the vector.
  const inputVectorB = [];

  // Determine the starting index for vector data in the input lines.
  // This is after the dimension line (1) and all matrix rows (matrixRowCount).
  const vectorDataStartLineIdx = 1 + matrixRowCount;

  // Iterate through the lines corresponding to the vector elements.
  for (let vectorElementIdx = 0; vectorElementIdx < vectorDimension; ++vectorElementIdx) {
    const currentVectorLine = segmentedInputLines[vectorDataStartLineIdx + vectorElementIdx];
    const parsedVectorComponent = parseInt(currentVectorLine, 10);

    // Validate that each parsed vector element is a number.
    if (isNaN(parsedVectorComponent)) {
      console.error(`Parsing Error: Non-numeric value '${currentVectorLine}' encountered in vector at index ${vectorElementIdx}.`);
      return;
    }
    inputVectorB.push(parsedVectorComponent);
  }

  // --- Matrix-Vector Multiplication Calculation ---

  // Iterate through each row of the 'inputMatrixA' to perform the dot product with 'inputVectorB'.
  // The result of this operation will be a vector where each element is the dot product
  // of a matrix row and the entire vector.
  for (let currentOutputRowIndex = 0; currentOutputRowIndex < matrixRowCount; ++currentOutputRowIndex) {
    const designatedMatrixRow = inputMatrixA[currentOutputRowIndex];
    let accumulatedRowProduct = 0; // This variable will store the dot product for the current row.

    // Utilize the 'reduce' method for a concise and functional calculation of the dot product.
    // 'reduce' iterates over the elements of 'designatedMatrixRow', accumulating the sum
    // of products of corresponding elements from the matrix row and the input vector.
    accumulatedRowProduct = designatedMatrixRow.reduce((currentSum, matrixVal, columnPosition) => {
      const correspondingVectorVal = inputVectorB[columnPosition];

      // Defensive check: Ensure a corresponding vector element exists.
      // This guards against potential `undefined * number` which results in `NaN`.
      if (correspondingVectorVal === undefined) {
        console.error(`Calculation Warning: Vector element at index ${columnPosition} is missing for matrix row ${currentOutputRowIndex}.`);
        // Depending on requirements, this might be an error or treated as a zero.
        return currentSum; // Skip this term if vector element is missing.
      }

      // Calculate the product of the current matrix element and its corresponding vector element.
      const termProduct = matrixVal * correspondingVectorVal;
      return currentSum + termProduct; // Add to the running total.
    }, 0); // The initial value for 'currentSum' (accumulator) is 0.

    // Output the computed dot product for the current matrix row to standard output.
    console.log(accumulatedRowProduct);
  }
}

// --- Program Entry Point ---

// This block handles reading the input from the standard input stream
// and invoking the main processing function.
try {
  // Dynamically import the 'fs' (file system) module for reading input.
  const fileSystemUtility = require("fs");

  // Read all data from '/dev/stdin' (standard input) synchronously.
  // The 'utf8' encoding is specified to handle text input correctly.
  const systemInputContent = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

  // Execute the primary function with the content read from standard input.
  processMatrixVectorOperation(systemInputContent);

} catch (executionIssue) {
  // Catch and report any errors that occur during file reading or the main operation.
  console.error("An unhandled exception occurred during program execution:", executionIssue.message);
  // For debugging, a full stack trace might be useful:
  // console.error(executionIssue.stack);
}