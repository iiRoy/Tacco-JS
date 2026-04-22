'use strict'
/*
 * This is a JavaScript program demonstrating a dynamic programming approach.
 * The main function processes input to calculate a specific result.
 *
 * Author: AI Code Clone Generator
 * Date: 2023-10-27
 */

function main(input) {

  // Split the input into lines.
  const lines = input.split('\n');

  // Parse the first line to get Height (H) and Width (W).
  const HW = lines.shift().split(' ').map(x => parseInt(x));
  const H = HW[0]; /* Height of the grid */
  const W = HW[1]; // Width of the grid

  // Initialize an array A to store the grid.
  const A = [];

  // Populate the grid A from the remaining input lines.
  // Each character in a line becomes an element in the inner array.
  for (var i = 0; i < H; i++) {
    A.push(lines.shift().split(''));
  }

  // Define a large prime number for modulo operation.
  const divider = 10e8 + 7;

  // Initialize a 2D array 'dp' for dynamic programming.
  // It will store the number of ways to reach each cell.
  const dp = [];

  // Fill 'dp' with arrays of zeros.
  for (var i = 0; i < H; i++) {
    dp.push(Array(W).fill(0))
  }

  // Base case: There is 1 way to reach the starting cell (0,0).
  dp[0][0] = 1;

  // Iterate through the grid to fill the dp table.
  // 'i' represents the row index.
  for (var i = 0; i < H; i++) {

    // 'j' represents the column index.
    for (var j = 0; j < W; j++) {

      // Check if we can come from the cell above (i-1, j).
      // Ensure we are not in the first row and the cell above is not an obstacle ('#').
      if (i > 0 && A[i - 1][j] != '#') {
        dp[i][j] += dp[i - 1][j];
      }

      // Check if we can come from the cell to the left (i, j-1).
      // Ensure we are not in the first column and the cell to the left is not an obstacle ('#').
      if (j > 0 && A[i][j - 1] != '#') {
        dp[i][j] += dp[i][j - 1];
      }

      // Apply modulo operation to keep the numbers within bounds.
      dp[i][j] %= divider
    }
  }

  // The result is the number of ways to reach the bottom-right cell (H-1, W-1).
  let result = dp[H - 1][W - 1];

  // Output the final result, ensuring it's still modulo 'divider'.
  console.log(result % divider);
}

// Read input from stdin and pass it to the main function.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));