/*
 * This JavaScript code reads input from standard input,
 * processes it to perform some calculations based on a grid,
 * and then prints a sum to the console.
 * It appears to be a dynamic programming problem solver.
 */
var input = require('fs') . readFileSync ( '/dev/stdin', 'utf8' ) ;
 /*
  * The input string is read from /dev/stdin.
  * Then it's trimmed of leading/trailing whitespace
  * and split into an array of strings by newline characters.
  */
var arr = input.trim() . split("\n");

// The main processing loop continues until a specific condition is met.
while ( true ) {

  // Read the first line of the current input block, split by space, and map to numbers.
  var wh = arr.shift() . split(" ") . map(Number);

  // Extract width and height from the parsed array.
  var w = wh[0];
  var h = wh[1]; /* Height of the grid */

  // Termination condition: if both width and height are zero, break the loop.
  if ( w == 0  &&  h == 0 ) break;

  // Initialize an array to store the grid data (y, x coordinates).
  var yx = [ ] ;

  // Populate the yx grid by reading 'h' lines from the input array.
  for ( var i = 0 ; i < h ; i++ )
   yx.push(arr.shift() . split(" ") . map(Number));

  // Initialize a 2D array for dynamic programming, filled with zeros.
  var dp = [];

  // Loop through rows to initialize the DP table.
  for ( var i = 0 ; i < h ; i++ ) {
    dp[i] = []; // Create a new row.
    // Loop through columns to initialize values.
    for ( var j = 0 ; j < w ; j++ ) {
      dp[i][j] = 0; // Set initial DP value to zero.
    }
  }

  // Core dynamic programming logic to fill the dp table.
  // Iterate over each cell in the grid.
  for ( var i = 0 ; i < h ; i++ ) {
    for ( var j = 0 ; j < w ; j++ ) {

      // Base case: If it's the first row and the cell value is 0, set dp to 1.
      if ( i == 0  &&  yx[i][j] == 0 )
        dp[i][j] = 1;
      else if ( i >= 1 ) { /* For rows other than the first one. */

        // Calculate potential contributions from previous cells.
        // 'a' from top-left (i-1, j-1)
        var a = ( j == 0  ||  yx[i-1][j-1] == 2 ) ? 0 : dp[i-1][j-1];

        // 'b' from directly above (i-1, j)
        var b = ( yx[i-1][j] == 2 ) ? 0 : dp[i-1][j];

        // 'c' from top-right (i-1, j+1)
        var c = ( j == w-1  ||  yx[i-1][j+1] == 2 ) ? 0 : dp[i-1][j+1];

        // 'd' from two rows above (i-2, j)
        var d = ( i >= 2  &&  yx[i-2][j] == 2 ) ? dp[i-2][j] : 0;

        // Apply rules based on the current cell's value (yx[i][j]).
        if ( yx[i][j] == 0 )
          dp[i][j] += a + b + c + d; // Sum contributions if yx[i][j] is 0.
        else if ( yx[i][j] == 1 )
          dp[i][j] = 0; // If yx[i][j] is 1, reset dp to 0.
        else if ( yx[i][j] == 2 )
          dp[i][j] += b + d; // If yx[i][j] is 2, sum only b and d.
      }
    }
  }

  // Calculate the final sum based on the last two rows of the dp table.
  var sum = 0;

  // Iterate from the second to last row up to the last row.
  for ( var i = h-2 ; i < h ; i++ ) {
    for ( var j = 0 ; j < w ; j++ ) {

      // Condition for the second to last row (h-2).
      if ( h >= 2  &&  i == h-2  &&  yx[i][j] == 2 )
        sum += dp[i][j];

      // Condition for the last row (h-1).
      if ( h >= 1  &&  i == h-1  &&  ( yx[i][j] == 0  ||  yx[i][j] == 2 ) )
        sum += dp[i][j];
    }
  }
  // Print the calculated sum for the current grid.
  console.log(sum);
}