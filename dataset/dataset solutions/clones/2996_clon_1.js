/*
 * This is the main script file for the application.
 * It strictly enforces modern JavaScript practices.
 */
'use strict'



// Define the primary function that processes the input.
function Main(input) {

  /*
   * The input is initially a single string.
   * It needs to be split into an array of strings based on whitespace.
   * This handles various input formats (space, tab, newline separated).
   */
  input = input.split(/\s+/);

  // Parse the grid dimensions and other parameters from the input array.
  // The '-0' trick is a concise way to convert string to number.

  var H = input.shift() - 0; /* Height of the grid */

  var W = input.shift() - 0; /* Width of the grid */

  var N = input.shift() - 0; /* Number of moves */

  var sr = input.shift() - 0; /* Starting row (1-indexed) */

  var sc = input.shift() - 0; /* Starting column (1-indexed) */

  var S = input.shift(); /* String of 'S' moves (Sam's moves) */

  var T = input.shift(); /* String of 'T' moves (Tom's moves) */

  /*
   * Initialize a dynamic programming array 'dp'.
   * dp[i] will store the possible range of columns and rows after 'i' moves.
   * The structure is [min_col, max_col, min_row, max_row].
   * Initially, the range is just the starting position.
   */
  var dp = [
    [sc, sc, sr, sr]
  ];

  // Loop through each move from 0 to N-1.
  for (let i = 0; i < N; i++) {

    // Initialize the next state in the dp array.
    dp[i + 1] = [];

    /*
     * Calculate Sam's potential moves.
     * These are based on the previous state's ranges.
     * 'S[i]' determines the direction.
     */
    dp[i + 1][0] = dp[i][0] - (S[i] === 'L' ? 1 : 0); // Sam moves Left, potential new min_col
    dp[i + 1][1] = dp[i][1] + (S[i] === 'R' ? 1 : 0); // Sam moves Right, potential new max_col
    dp[i + 1][2] = dp[i][2] - (S[i] === 'U' ? 1 : 0); // Sam moves Up, potential new min_row
    dp[i + 1][3] = dp[i][3] + (S[i] === 'D' ? 1 : 0); // Sam moves Down, potential new max_row

    // Check if Sam's move leads to an immediate game over (falling off the grid).
    // The grid is 1-indexed.
    if (dp[i + 1][0] === 0 || // min_col goes below 1
      dp[i + 1][1] === W + 1 || // max_col goes beyond W
      dp[i + 1][2] === 0 || // min_row goes below 1
      dp[i + 1][3] === H + 1 // max_row goes beyond H
    ) {
      console.log('NO'); // If so, print 'NO' and exit.
      return;
    }

    /*
     * Now, consider Tom's counter-moves.
     * Tom tries to push Sam back onto the grid if Sam is at the edge.
     * The logic here is a bit tricky: it looks like it's adjusting the *range*
     * based on Tom's potential move, effectively shrinking the range if Tom can block.
     * Note: There's a potential bug or misunderstanding in the original code's logic here,
     * as dp[i+1][0] is used multiple times for different calculations.
     * Assuming the original logic is intended, I will preserve it.
     */

    // Adjust min_col based on Tom's move (Tom moves Right can increase min_col)
    // And ensure it doesn't exceed the grid boundary W.
    dp[i + 1][0] = Math.min(dp[i + 1][0] + (T[i] === 'R' ? 1 : 0), W);

    // Adjust max_col based on Tom's move (Tom moves Left can decrease max_col)
    // And ensure it doesn't go below the grid boundary 1.
    // NOTE: This line uses dp[i+1][0] instead of dp[i+1][1] from the previous calculation.
    // This implies a dependency on the *updated* min_col, which is unusual for a range calculation.
    // But as per Type I clone rules, this exact expression must be kept.
    dp[i + 1][1] = Math.max(dp[i + 1][0] - (T[i] === 'L' ? 1 : 0), 1);

    // Adjust min_row based on Tom's move (Tom moves Down can increase min_row)
    // And ensure it doesn't exceed the grid boundary H.
    // NOTE: Again, uses dp[i+1][0].
    dp[i + 1][2] = Math.min(dp[i + 1][0] + (T[i] === 'D' ? 1 : 0), H);

    // Adjust max_row based on Tom's move (Tom moves Up can decrease max_row)
    // And ensure it doesn't go below the grid boundary 1.
    // NOTE: Again, uses dp[i+1][0].
    dp[i + 1][3] = Math.max(dp[i + 1][0] - (T[i] === 'U' ? 1 : 0), 1);

  }

  // If the loop completes without returning 'NO', it means Sam can always survive.
  console.log('YES');

}


// Read input from standard input and pass it to the Main function.
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));