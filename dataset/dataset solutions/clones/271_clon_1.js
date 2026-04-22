/*
 * This file contains a JavaScript implementation for a specific algorithm.
 * It calculates and displays a magic square-like pattern.
 *
 * The 'bomb' function is a recursive helper to fill the grid.
 */

function   bomb  ( y , x )
{
   // Check if the current number N has reached its maximum allowed value.
   if ( N == max )
      return ;

   // Adjust x coordinate if it goes out of bounds (wraps around horizontally).
   if ( x < 0 )
      x = n - 1 ;

   // Adjust y coordinate if it goes out of bounds (wraps around vertically).
   if ( y < 0 )
      y = n - 1 ;

   // Adjust x coordinate if it exceeds bounds (wraps around horizontally).
   if ( x >= n )
      x = 0 ;

   // Adjust y coordinate if it exceeds bounds (wraps around vertically).
   if ( y >= n )
      y = 0 ;

   // Check if the current cell (y, x) is already filled.
   if ( yx[y][x] != -1 )
   {
      // If filled, try the next position diagonally up-left.
      bomb( y + 1 , x - 1 ) ;
   }
   else
   {
      // If empty, fill the cell with the current number N.
      yx[y][x] = N ;
      // Increment N for the next cell.
      N ++ ;
      // Recursively call bomb for the next position diagonally down-right.
      bomb( y + 1 , x + 1 ) ;
   }
}


// Standard input reading setup for competitive programming environments.
var input = require('fs').readFileSync('/dev/stdin', 'utf8') ;

// Process the input: trim whitespace, split into lines, and convert each line to a Number.
var Arr = ( input.trim() ).split("\n").map( Number ) ;

// Iterate through each number provided in the input array.
for ( var i = 0 ; i < Arr.length ; i ++ )
{
   // 'n' represents the dimension of the square grid for the current test case.
   var n = Arr[i] ;

   // 'max' is the stopping condition for the 'bomb' function, one greater than the total cells.
   var max = n * n + 1 ;

   // If n is 0, it signifies the end of input or an invalid case, so break the loop.
   if ( n == 0 )
      break ;

   // Initialize a 2D array (grid) to store the pattern.
   var yx = [] ;

   // Populate the grid with initial values (-1 indicating an empty cell).
   for ( var j = 0 ; j < n ; j ++ )
   {
      yx[j] = [] ; // Initialize inner array for each row.
      for ( var k = 0 ; k < n ; k ++ )
      {
         yx[j][k] = -1 ; // Set each cell to -1 initially.
      }
   }

   // Determine the starting position (x, y) for the pattern generation.
   // x is the middle column.
   var x = Math.floor( n / 2 ) ;
   // y is one row below the middle column (for an 'n/2 + 1' start row in a 0-indexed system).
   var y = x + 1 ;

   // Place the first number (1) in the calculated starting position.
   yx[y][x] = 1 ;

   // Initialize N, the next number to be placed in the grid.
   var N = 2 ;

   // Start the recursive filling process from the next logical position.
   bomb( y + 1 , x + 1 ) ;

   // Output the generated grid to the console.
   // - yx.join("\n") converts the 2D array into a string with rows separated by newlines.
   // - .replace(/\,/g," ") replaces commas (from array joining) with spaces.
   // - .replace(/^/mg," ") adds a leading space to each line for formatting.
   console.log( yx.join("\n").replace( /\,/g , " " ).replace( /^/mg , " " ) ) ;
}
// End of the main loop processing input arrays.

/*
 * This concludes the program execution.
 * All test cases from the input have been processed.
 */