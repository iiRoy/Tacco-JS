/**
 * Main function to process input and execute the dynamic programming solution.
 * This function handles reading input, parsing it, and then calling the
 * core logic to calculate the result.
 */
function Main(  input  )
{
  // Split the input string into an array of lines.
  input = input .split( "\n"  ) ;


  // Define a helper arrow function to convert string to integer.
  // This function takes a string 'n' and parses it as a base-10 integer.
  const  changeInt  =  (  (  n  )  =>
  {
    return  parseInt(  n,  10  )  ; // Parse 'n' as a decimal integer.
  }  )  ;

  /*
   * Extract H (height) and W (width) from the first line of input.
   * The first line contains two space-separated integers.
   * We use the 'changeInt' function to convert them from strings to numbers.
   */
  const  [H, W]  =  input[0] .split( ' ' ) .map(  changeInt  ) ;

  // Initialize an empty array to store the grid.
  const  grid  =  [  ]  ;

  // Loop through the input lines to populate the grid.
  // The grid rows start from the second line of input (index 1).
  for  (  var  h  =  0  ;  h  <  H  ;  h++  )
  {
    // Each line (row) of the grid is split into an array of characters.
    grid .push(  input[h  +  1] .split(  ''  )  )  ;
  }

  // Calculate the result using the dp function and print it.
  // The result is taken modulo (10^9 + 7) to prevent overflow for large numbers.
  console .log(  dp(  H,  W,  grid  )  %  (  10**9  +  7  )  )  ;
}

// Invoke the Main function with the input read from standard input.
// This reads the entire file content as a UTF-8 string.
Main(  require(  "fs"  ) .readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;


/**
 * Dynamic programming function to count paths from (0,0) to (H-1,W-1)
 * in a grid, avoiding '#' cells.
 * @param {number} H - The height of the grid.
 * @param {number} W - The width of the grid.
 * @param {string[][]} grid - The 2D array representing the grid,
 *                             where '#' denotes an obstacle.
 * @returns {number} The number of unique paths.
 */
function  dp(  H,  W,  grid  )
{
  // Initialize a 2D DP array with dimensions H x W, filled with zeros.
  // Each cell dp[h][w] will store the number of ways to reach (h,w).
  const  dp  =  Array(  H  ) .fill(  0  ) .map(  n  =>  Array(  W  ) .fill(  0  )  )  ;

  // Base case: There is 1 way to reach the starting cell (0,0).
  dp[0][0]  =  1  ;

  // Iterate through each cell of the grid to fill the DP table.
  for  (  var  h  =  0  ;  h  <  H  ;  h++  )
  {
    for  (  var  w  =  0  ;  w  <  W  ;  w++  )
    {
      // If the current cell is an obstacle ('#'), then no paths can go through it.
      // So, we skip this cell and its value remains 0 (initial value).
      if  (  grid[h][w]  ===  '#'  )  continue  ;

      // If we are not in the first row (h > 0),
      // paths can come from the cell directly above (h-1, w).
      if  (  h  >  0  )
      {
        dp[h][w]  =  dp[h  -  1][w]  +  dp[h][w]  ;
      }

      // If we are not in the first column (w > 0),
      // paths can come from the cell directly to the left (h, w-1).
      // We add this to the current count, effectively summing paths from top and left.
      if  (  w  >  0  )
      {
        dp[h][w]  =  dp[h][w]  +  dp[h][w  -  1]  ;
      }
    }
  }

  // The final result is the number of ways to reach the bottom-right cell (H-1, W-1).
  return  dp[H  -  1][W  -  1]  ;
}