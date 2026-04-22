let receivedStreamContent = ''; // Variable to store all incoming data from standard input

// Obtain the standard input stream object from the Node.js process
const inputSource = process.stdin;

// Resume the input stream to begin receiving data
inputSource.resume();

// Set the character encoding for the input stream to UTF-8
inputSource.setEncoding('utf-8');

// Register an event listener for when data 'chunks' arrive
inputSource.on('data', function (dataPortion) {
  // Append each received data portion to our accumulator variable
  receivedStreamContent += dataPortion;
});

// Register an event listener for when the input stream has finished
inputSource.on('end', function () {
  // Split the entire received content into an array of individual lines
  const parsedLines = receivedStreamContent.split('\n');

  // The first line contains the dimensions (N and M) as space-separated numbers
  const dimensionsString = parsedLines[0].split(' ');
  const numRows = parseInt(dimensionsString[0], 10); // Parse N (number of rows)
  const numCols = parseInt(dimensionsString[1], 10); // Parse M (number of columns)

  // Declare and initialize a 2D array (matrix) for 'A' with N rows
  const matrixElements = new Array(numRows);
  let currentMatrixRowIdx = 0; // Index for populating matrix rows

  // Iterate from the second line (index 1) up to N lines to fill matrix A
  for (let lineIterator = 1; lineIterator <= numRows; lineIterator++) {
    // Split the current line by spaces and convert all parts to numbers
    const rowNumericValues = parsedLines[lineIterator].split(' ').map(Number);
    
    // Initialize the current row of the matrix as an empty array
    matrixElements[currentMatrixRowIdx] = [];
    
    // Populate the columns for the current matrix row
    for (let columnIterator = 0; columnIterator < numCols; columnIterator++) {
      matrixElements[currentMatrixRowIdx][columnIterator] = rowNumericValues[columnIterator];
    }
    // Increment the matrix row index
    currentMatrixRowIdx++;
  }

  // Declare and initialize an array (vector) for 'B' with M elements
  const inputVector = new Array(numCols);
  let vectorIndex = 0; // Index for populating vector elements

  // Iterate from line N+1 up to N+M lines to fill vector B
  for (let inputLineIndex = numRows + 1; inputLineIndex <= numRows + numCols; inputLineIndex++) {
    // Split the current line by spaces and convert parts to numbers
    const vectorRowValues = parsedLines[inputLineIndex].split(' ').map(Number);
    
    // Assign the array of numeric values directly to the vector element
    // Note: This makes inputVector an array of arrays, e.g., [[10], [20]]
    inputVector[vectorIndex++] = vectorRowValues;
  }

  // Declare and initialize the result array (vector) 'C' with N elements
  const resultVector = new Array(numRows);

  // Perform the matrix-vector multiplication (C = A * B)
  for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
    // Initialize the current result vector element to zero
    resultVector[rowIdx] = 0;
    
    // Iterate through columns to calculate the dot product for the current row
    for (let colIdx = 0; colIdx < numCols; colIdx++) {
      // Add the product of A[rowIdx][colIdx] and B[colIdx] to the sum
      // IMPORTANT: If inputVector[colIdx] is an array (e.g., [5]), this multiplication
      // will result in NaN, as per the original code's logic.
      resultVector[rowIdx] += matrixElements[rowIdx][colIdx] * inputVector[colIdx];
    }
  }

  // Output the elements of the result vector, each separated by a newline character
  console.log(resultVector.join('\n'));
});