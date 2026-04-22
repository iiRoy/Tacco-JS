// This JavaScript module is designed to read numerical data from standard input,
// interpret it as a matrix (A) and a vector (B), perform a matrix-vector
// multiplication (C = A * B), and then print the resulting vector (C) to
// standard output, with each element on a new line.
//
// The expected input format is:
// Line 1: two integers, N M (representing N rows and M columns for matrix A,
//         and M elements for vector B)
// Next N lines: M space-separated integers, forming a row of matrix A
// Next M lines: 1 integer, forming an element of vector B
//
// Example Input:
// 2 3
// 1 2 3
// 4 5 6
// 7
// 8
// 9
//
// In this example:
// A = [[1, 2, 3], [4, 5, 6]] (2x3 matrix)
// B = [7, 8, 9] (3x1 vector)
//
// The calculation would be:
// C[0] = (1*7) + (2*8) + (3*9) = 7 + 16 + 27 = 50
// C[1] = (4*7) + (5*8) + (6*9) = 28 + 40 + 54 = 122
// Output:
// 50
// 122

// A mutable string buffer to accumulate all data received from standard input.
let accumulatedInputString = '';

// Obtain a reference to the standard input stream object.
const stdInputReader = process.stdin;

// Prepare the standard input stream to start emitting data.
stdInputReader.resume();

// Configure the input stream to decode incoming bytes as UTF-8 characters.
stdInputReader.setEncoding('utf-8');

/**
 * Parses a single string line into an array of floating-point numbers.
 * It handles potential extra whitespace and empty strings gracefully.
 *
 * @param {string} lineContent The string content of a single input line.
 * @returns {number[]} An array containing the parsed numbers.
 */
const extractNumbersFromLine = (lineContent) => {
  // Trim leading/trailing whitespace, split by one or more spaces, and
  // convert each resulting string part into a number.
  return lineContent.trim().split(/\s+/).map(Number);
};

// Register an event handler for when new data 'chunks' arrive from stdin.
stdInputReader.on('data', (incomingDataChunk) => {
  // Append the new chunk to our overall input buffer.
  accumulatedInputString += incomingDataChunk;
});

// Register an event handler for when the 'end' of the stdin stream is reached.
// This signifies that all input has been received and can now be processed.
stdInputReader.on('end', () => {
  // Split the entire accumulated input into individual lines.
  // Using .trim() first helps in handling potential trailing newlines.
  const allParsedLines = accumulatedInputString.trim().split('\n');

  // --- Input Validation and Dimension Extraction ---
  // Ensure we have at least one line for dimensions.
  if (allParsedLines.length === 0) {
    console.error("Error: No input lines provided. Expected at least dimensions.");
    process.exit(1); // Terminate with an error code.
  }

  // Parse the first line to get the matrix dimensions (N and M).
  const dimensionParameters = extractNumbersFromLine(allParsedLines[0]);

  // Validate that exactly two dimension parameters were provided.
  if (dimensionParameters.length !== 2) {
    console.error("Error: Invalid dimension specification. Expected two numbers (N M) on the first line.");
    process.exit(1);
  }

  const matrixRowsCount = dimensionParameters[0]; // N
  const matrixColsCount = dimensionParameters[1]; // M

  // Validate that dimensions are positive integers.
  if (matrixRowsCount <= 0 || matrixColsCount <= 0 || !Number.isInteger(matrixRowsCount) || !Number.isInteger(matrixColsCount)) {
    console.error("Error: Matrix dimensions (N and M) must be positive integers.");
    process.exit(1);
  }

  // Calculate the total number of lines expected for the full input.
  const expectedTotalLines = 1 + matrixRowsCount + matrixColsCount;
  if (allParsedLines.length < expectedTotalLines) {
    console.error(`Error: Insufficient input lines. Expected ${expectedTotalLines} lines, but received ${allParsedLines.length}.`);
    process.exit(1);
  }

  // --- Matrix A Population ---
  // Initialize the primary matrix (A) as an empty array of arrays.
  const primaryMatrixA = [];
  // Iterate from the second line (index 1) up to 'matrixRowsCount' lines for Matrix A.
  for (let currentMatrixRow = 0; currentMatrixRow < matrixRowsCount; currentMatrixRow++) {
    const dataLineIndex = 1 + currentMatrixRow; // The actual line number in allParsedLines.
    const numericRowData = extractNumbersFromLine(allParsedLines[dataLineIndex]);

    // Validate that each row of Matrix A has the correct number of columns.
    if (numericRowData.length !== matrixColsCount) {
      console.error(`Error: Matrix A row ${currentMatrixRow + 1} has ${numericRowData.length} elements, but expected ${matrixColsCount}.`);
      process.exit(1);
    }
    primaryMatrixA.push(numericRowData); // Add the parsed row to Matrix A.
  }

  // --- Vector B Population ---
  // Initialize the secondary vector (B) as a flat array.
  const secondaryVectorB = [];
  // Iterate for 'matrixColsCount' lines, starting after Matrix A.
  for (let currentVectorElement = 0; currentVectorElement < matrixColsCount; currentVectorElement++) {
    const dataLineIndex = 1 + matrixRowsCount + currentVectorElement; // The actual line number.
    const elementValueArray = extractNumbersFromLine(allParsedLines[dataLineIndex]);

    // Validate that each line for Vector B contains exactly one number.
    if (elementValueArray.length !== 1) {
      console.error(`Error: Vector B element ${currentVectorElement + 1} line has ${elementValueArray.length} values, but expected 1.`);
      process.exit(1);
    }
    // Extract the single number and add it to Vector B.
    // This explicitly fixes the potential bug in the original code where B might become an array of single-element arrays.
    secondaryVectorB.push(elementValueArray[0]);
  }

  // --- Matrix-Vector Multiplication (C = A * B) ---
  // The resulting vector C will have 'matrixRowsCount' elements.
  // Initialize it with zeros to facilitate summation.
  const finalResultVectorC = new Array(matrixRowsCount).fill(0);

  // Loop through each row of Matrix A.
  for (let rIdx = 0; rIdx < matrixRowsCount; rIdx++) {
    let currentDotProductSum = 0; // Accumulator for the dot product of the current row.
    // Loop through each column of Matrix A (which corresponds to elements of Vector B).
    for (let cIdx = 0; cIdx < matrixColsCount; cIdx++) {
      // Perform the element-wise multiplication and accumulate the sum.
      currentDotProductSum += primaryMatrixA[rIdx][cIdx] * secondaryVectorB[cIdx];
    }
    // Store the computed dot product in the result vector.
    finalResultVectorC[rIdx] = currentDotProductSum;
  }

  // --- Output Generation ---
  // Join all elements of the result vector (C) with a newline character
  // and print the final string to standard output.
  console.log(finalResultVectorC.join('\n'));
});