function processInput(rawData) {
  // The input string is trimmed and then split into an array of individual lines.
  const lines = rawData.trim().split("\n");

  // Declare variables to store the dimensions of the matrix.
  let rows, cols;

  // The first line of input contains the dimensions N (rows) and M (columns).
  // These are parsed from a space-separated string into numbers.
  [rows, cols] = lines[0].split(" ").map((valStr) => Number(valStr));

  // Initialize a new array to represent the matrix 'A'.
  // Its size is determined by the number of rows (N).
  let matrixA = new Array(rows);

  // Populate the matrix 'A' from the subsequent input lines.
  // Each line represents a row, and its elements are parsed as numbers.
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    matrixA[rowIndex] = lines[rowIndex + 1].split(" ").map((valStr) => Number(valStr));
  }

  // Initialize another array to represent the vector 'B'.
  // Its size is determined by the number of columns (M).
  let vectorB = new Array(cols);

  // Populate the vector 'B' from the input lines that follow the matrix 'A'.
  // Each element is parsed as a number.
  for (let rowIndex = 0; rowIndex < cols; rowIndex++) {
    vectorB[rowIndex] = Number(lines[rows + 1 + rowIndex]);
  }

  // Perform the matrix-vector multiplication.
  // Iterate through each row of the matrix 'A'.
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    // Initialize a variable to accumulate the sum for the current row's result.
    let resultSum = 0;

    // Iterate through each column of the matrix 'A' (which corresponds to elements of vector 'B').
    for (let colIndex = 0; colIndex < cols; colIndex++) {
      // Multiply the current matrix element by the corresponding vector element
      // and add it to the running sum for the current row.
      resultSum += matrixA[rowIndex][colIndex] * vectorB[colIndex];
    }
    // Output the calculated sum for the current row to the console.
    console.log(resultSum);
  }
}

// Read the entire content of standard input as a UTF-8 string
// and then pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
