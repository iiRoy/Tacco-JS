/*
 * This JavaScript code reads input, processes it to solve a specific problem,
 * and then prints the result to the console.
 * It uses standard Node.js modules for file system operations.
 */
var   input = require('fs') . readFileSync('/dev/stdin' , 'utf8' ) ;
// The 'fs' module is used to interact with the file system.
// readFileSync reads the entire file synchronously.
// '/dev/stdin' is the standard input stream.
// 'utf8' specifies the encoding.

// The input string is then processed.
var arr = input . trim() . split("\n");
// .trim() removes leading/trailing whitespace.
// .split("\n") divides the string into an array of lines.


/*
 * The main logic of the program resides within this infinite loop.
 * It continues to process input sets until a specific termination condition is met.
 */
while ( true )
{
   // Reads the first line of the current input set, which contains width and height.
   var   wh  = arr . shift() . split(" ") . map( Number ) ;
   // .shift() removes and returns the first element from the 'arr' array.
   // .split(" ") divides the line into an array of strings based on space.
   // .map(Number) converts each string element to a number.

   // Extracts the width (w) and height (h) from the parsed array.
   var w = wh[ 0 ] ; // Width is the first element.
   var h = wh[ 1 ] ; // Height is the second element.

   // This is the termination condition for the infinite loop.
   // If both width and height are 0, the program stops.
   if ( w == 0 && h == 0 )
   {
      break ; // Exit the while loop.
   }


   // Initializes an array 'yx' to store the grid data for the current problem instance.
   var yx = [ ] ;
   // This array will hold the 2D grid of numbers.

   // Populates the 'yx' grid with data from subsequent input lines.
   for ( var i = 0 ; i < h ; i ++ )
   {
      // Each line represents a row in the grid.
      yx . push ( arr . shift() . split(" ") . map( Number ) ) ;
      // Reads a line, splits it by space, converts to numbers, and adds as a row to 'yx'.
   }


   // Initializes a 2D dynamic programming array 'dp' with dimensions h x w.
   var dp = [ ] ;
   // This array will store calculated values for the DP solution.

   // Fills the 'dp' array with initial values of 0.
   for ( var i = 0 ; i < h ; i ++ )
   {
      dp [ i ] = [ ] ; // Initialize each row as an empty array.
      for ( var j = 0 ; j < w ; j ++ )
      {
         dp [ i ] [ j ] = 0 ; // Set each cell to 0.
      }
   }


   /*
    * The core dynamic programming calculation loop.
    * It iterates through each cell of the grid (from top-left to bottom-right)
    * to compute values based on previous cells and the 'yx' grid data.
    */
   for ( var i = 0 ; i < h ; i ++ )
   {
      for ( var j = 0 ; j < w ; j ++ )
      {
         // Special handling for the first row (i == 0).
         if ( i == 0 && yx[ i ] [ j ] == 0 )
         {
            dp [ i ] [ j ] = 1 ; // If it's the first row and cell value is 0, set dp to 1.
         }
         else if ( i >= 1 ) // For all rows starting from the second row (i >= 1).
         {
            // Calculate 'a': value from top-left diagonal cell.
            // If j is 0 (first column) or the top-left cell is '2', then 'a' is 0.
            // Otherwise, 'a' takes the value from dp[i-1][j-1].
            var a = ( j == 0 || yx [ i - 1 ] [ j - 1 ] == 2 ) ? 0 : dp [ i - 1 ] [ j - 1 ] ;

            // Calculate 'b': value from the cell directly above.
            // If the cell directly above is '2', then 'b' is 0.
            // Otherwise, 'b' takes the value from dp[i-1][j].
            var b = ( yx [ i - 1 ] [ j ] == 2 ) ? 0 : dp [ i - 1 ] [ j ] ;

            // Calculate 'c': value from top-right diagonal cell.
            // If j is w-1 (last column) or the top-right cell is '2', then 'c' is 0.
            // Otherwise, 'c' takes the value from dp[i-1][j+1].
            var c = ( j == w - 1 || yx [ i - 1 ] [ j + 1 ] == 2 ) ? 0 : dp [ i - 1 ] [ j + 1 ] ;

            // Calculate 'd': value from the cell two rows above (straight up).
            // If i is less than 2 (not enough rows above) or the cell two rows above is '2', then 'd' is 0.
            // Otherwise, 'd' takes the value from dp[i-2][j].
            var d = ( i >= 2 && yx [ i - 2 ] [ j ] == 2 ) ? dp [ i - 2 ] [ j ] : 0 ;

            // Based on the current cell's value in 'yx', update dp[i][j].
            if ( yx [ i ] [ j ] == 0 )
            {
               dp [ i ] [ j ] += a + b + c + d ; // If '0', sum up all four contributing paths.
            }
            else if ( yx [ i ] [ j ] == 1 )
            {
               dp [ i ] [ j ] = 0 ; // If '1', path is blocked, set to 0.
            }
            else if ( yx [ i ] [ j ] == 2 )
            {
               dp [ i ] [ j ] += b + d ; // If '2', only paths from directly above (b) and two above (d) contribute.
            }
         }
      }
   }


   // Initializes 'sum' to accumulate the final result.
   var sum = 0 ;

   /*
    * This loop calculates the final sum based on the last two rows of the 'dp' array.
    * It checks specific conditions in the 'yx' array for cells in these rows.
    */
   for ( var i = h - 2 ; i < h ; i ++ )
   {
      // Iterates through rows: h-2 (second to last) and h-1 (last).
      for ( var j = 0 ; j < w ; j ++ )
      {
         // Condition for the second to last row (i == h-2).
         if ( i == h - 2 && yx [ i ] [ j ] == 2 )
         {
            sum += dp [ i ] [ j ] ; // If '2', add its dp value to sum.
         }

         // Condition for the last row (i == h-1).
         if ( i == h - 1 && ( yx [ i ] [ j ] == 0 || yx [ i ] [ j ] == 2 ) )
         {
            sum += dp [ i ] [ j ] ; // If '0' or '2', add its dp value to sum.
         }
      }
   }

   // Prints the calculated sum for the current problem instance to standard output.
   console . log ( sum ) ;
   // The output is the final accumulated sum.
} // End of the main while loop.