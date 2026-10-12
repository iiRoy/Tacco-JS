let rawInputBuffer = '';
const inputSource = process.stdin;

inputSource.resume();
inputSource.setEncoding('utf-8');

inputSource.on('data', (chunk) => {
  rawInputBuffer += chunk;
});

inputSource.on('end', () => {
  // Helper function to process raw input string into an array of lines
  const processRawInputToLines = (textData) => textData.split('\n');
  const inputLines = processRawInputToLines(rawInputBuffer);

  // Extract matrix dimensions from the first line
  const dimensionStrings = inputLines[0].split(' ');
  const matrixARows = Number(dimensionStrings[0]); // Using Number() for parsing
  const matrixACols = Number(dimensionStrings[1]);

  // Populate matrix A using a functional approach (slice and map)
  // This replaces the explicit for-loop and manual array creation
  const matrixAData = inputLines.slice(1, 1 + matrixARows).map(lineContent =>
    lineContent.split(' ').map(Number)
  );

  // Populate vector b (which is an array of single-element arrays, replicating original behavior)
  // Using slice and map for conciseness
  const vectorBData = inputLines.slice(1 + matrixARows, 1 + matrixARows + matrixACols).map(lineContent =>
    lineContent.split(' ').map(Number)
  );

  // Helper function to compute the product sum for a single row of A and vector B
  // This function explicitly replicates the original behavior where multiplying a number
  // by an array (e.g., `5 * [10]`) results in NaN.
  const calculateRowProductSum = (currentARow, fullVectorB) => {
    let accumulatedSum = 0;
    // Iterate through columns of A (which is also the effective length of B)
    for (let colIndex = 0; colIndex < matrixACols; colIndex++) {
      // The original code performs A[i][j] * b[j], where b[j] is an array like [number].
      // This multiplication results in NaN. We must preserve this exact behavior.
      accumulatedSum += currentARow[colIndex] * fullVectorB[colIndex];
    }
    return accumulatedSum;
  };

  // Initialize the result vector
  const resultVector = new Array(matrixARows);

  // Perform the matrix-vector multiplication using the helper function
  for (let rowIndex = 0; rowIndex < matrixARows; rowIndex++) {
    resultVector[rowIndex] = calculateRowProductSum(matrixAData[rowIndex], vectorBData);
  }

  // Output the final result, each element on a new line
  console.log(resultVector.join('\n'));
});
