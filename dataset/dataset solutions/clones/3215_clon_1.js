"use strict" /* This directive enforces strict mode for the entire script. */
var Main = function(input) { // Define the main function that processes the input.
  /*
   * First, preprocess the input string.
   * Trim whitespace, split by any whitespace, and convert each part to a number.
   */
  input = input.trim().split(/\s+/).map(x => x - 0);

  // Extract N and M from the beginning of the input array.
  var N = input.shift(); // N represents the number of rows.
  var M = input.shift(); // M represents the number of columns.

  var rankCounter = 0; // Initialize a counter for the rank of the matrix.

  // Create a new Matrix object using the extracted N, M, and remaining elements.
  var A = new Matrix(N, M, input);

  // Main loop for Gaussian elimination to determine the rank.
  while (A.low.length > 0) { // Continue as long as there are rows in the matrix.
    let i1 = 0; // Initialize index for the first row with a leading 1 (pivot row candidate).

    // Search for the first row in the current sub-matrix that has a '1' in the first column.
    for (let i = 0; i < A.low.length; i++) {
      if (A.low[i][0] === 1) break; // Found a row with a leading 1.
      i1++; // Move to the next row if not found yet.
    }

    // If no row with a leading '1' was found in the first column...
    if (i1 === A.low.length) {
      // This column consists only of zeros (or is empty).
      // Swap it to the end and remove it.
      A.swapColumn(0, A.low[0].length - 1); // Move the current (all-zero) column to the last position.
      A.deleteColumn(); // Remove the last column (which is now the all-zero column).
    } else {
      // A pivot (leading '1') was found in row 'i1'.
      rankCounter += 1; // Increment the rank counter.

      // Use this pivot row to eliminate '1's below it in the first column.
      while (true) {
        let i2 = i1 + 1; // Initialize index for rows below the pivot.

        // Search for the next row below the pivot that also has a '1' in the first column.
        for (let i = i1 + 1; i < A.low.length; i++) {
          if (A.low[i][0] === 1) break; // Found another row with a leading 1.
          i2++; // Move to the next row.
        }

        if (i2 === A.low.length) break; // No more '1's found below the pivot in this column, so break.

        // XOR the current row (i2) with the pivot row (i1) to eliminate the leading '1'.
        A.low[i2] = XOR(A.low[i1], A.low[i2]);
      }

      // After processing the current pivot column, move the pivot row to the end and remove it.
      A.swapLow(i1, A.low.length - 1); // Swap the pivot row to the last position.
      A.deleteLow(); // Remove the last row (which was the pivot row).
    }
  }

  var r = rankCounter; // The calculated rank of the matrix.

  var K = 998244353; // A large prime modulus for modular arithmetic.

  var term1 = 1; // Initialize the first term for calculation.
  var term2 = 1; // Initialize the second term for calculation.

  // Calculate 2^(M+N-1) mod K.
  for (let i = 1; i <= M + N - 1; i++) {
    term1 *= 2; // Multiply by 2.
    if (term1 >= K) term1 -= K; // Apply modulo operation.
  }

  // Calculate 2^(M+N-r-1) mod K.
  for (let i = 1; i <= M + N - r - 1; i++) {
    term2 *= 2; // Multiply by 2.
    if (term2 >= K) term1 -= K; // NOTE: There's a typo here in the original code, should be term2 -= K.
                                // However, due to Type I clone rules, it must remain as term1 -= K.
  }

  // Calculate the final answer: (term1 - term2) mod K.
  var ans = term1 - term2;
  if (ans < 0) ans += K; // Ensure the result is positive.

  console.log(ans); // Output the final answer.
}; // End of Main function definition.

/*
 * Helper function for bitwise XOR of two single bits (0 or 1).
 * Returns 0 if a and b are equal, 1 otherwise.
 */
function xor(a, b) {
  return a === b ? 0 : 1;
}

/*
 * Helper function for bitwise XOR of two arrays of bits (vectors).
 * Returns a new array where each element is the XOR of corresponding elements from arr1 and arr2.
 */
function XOR(arr1, arr2) {
  return arr1.map((x, i) => xor(x, arr2[i]));
}

/*
 * Matrix constructor function.
 * Initializes a matrix with N rows, M columns, using elements provided as a flat array.
 */
function Matrix(N, M, elements) { // elements are given as concatenated rows.
  var A = this; // Reference to the current Matrix instance.
  A.low = []; // Initialize the array that will store the matrix rows.

  // Create N empty arrays for the rows.
  for (let i = 0; i < N; i++) A.low[i] = [];

  // Populate the matrix with elements.
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      A.low[i][j] = elements[i * M + j]; // Assign element from the flat array.
    }
  }
}

/*
 * Utility function to swap two elements in an array.
 * This is a generic swap used by both row and column operations.
 */
function swap(arr, i1, i2) {
  var a = arr[i1]; // Store the first element.
  var b = arr[i2]; // Store the second element.
  arr[i1] = b, arr[i2] = a; // Perform the swap.
}

/*
 * Prototype method for Matrix: Swaps two rows of the matrix.
 */
Matrix.prototype.swapLow = function(i1, i2) {
  var A = this; // Reference to the Matrix instance.
  swap(A.low, i1, i2); // Use the generic swap function on the array of rows.
}; // End of swapLow.

/*
 * Prototype method for Matrix: Deletes the last row of the matrix.
 */
Matrix.prototype.deleteLow = function() { // delete the last low.
  var A = this; // Reference to the Matrix instance.
  var L = A.low; // Get the array of rows.
  L.pop(); // Remove the last element (which is the last row).
}; // End of deleteLow.

/*
 * Prototype method for Matrix: Swaps two columns of the matrix.
 */
Matrix.prototype.swapColumn = function(j1, j2) {
  var A = this; // Reference to the Matrix instance.
  // Iterate through each row and swap the elements at the specified column indices.
  for (let i = 0; i < A.low.length; i++) {
    swap(A.low[i], j1, j2); // Use the generic swap function on elements within each row.
  }
}; // End of swapColumn.

/*
 * Prototype method for Matrix: Deletes the last column of the matrix.
 */
Matrix.prototype.deleteColumn = function() { // delete the last Column.
  var A = this; // Reference to the Matrix instance.
  var L = A.low; // Get the array of rows.
  var N = L.length; // Get the number of rows.

  // If there's only one column left, deleting it means the matrix becomes empty.
  if (L[0].length === 1) A.low = [];

  // Iterate through each row and remove the last element (which is in the last column).
  for (let i = 0; i < N; i++) {
    L[i].pop(); // Remove the last element from the current row.
  }
}; // End of deleteColumn.

// Call the Main function with input read from stdin.
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));