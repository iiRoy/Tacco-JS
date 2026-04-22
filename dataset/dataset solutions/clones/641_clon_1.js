/*
 * This is a Type I clone example.
 * The original code calculates the minimum cost for a specific problem.
 * It reads input from standard input, processes it, and finds an optimal value.
 */

// Import the 'fs' module to handle file system operations, specifically reading files.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' ,  'utf8' );

// Process the raw input string:
// 1. Trim leading/trailing whitespace.
// 2. Replace 'W' with '0', 'B' with '1', and 'R' with '2' to convert colors into numeric representations.
// 3. Split the string into an array of lines based on newline characters.
var arr = input . trim() . replace( /W/g , "0" ) . replace( /B/g , "1" ) . replace( /R/g , "2" ) . split( "\n" );

// Extract the dimensions (N and M) from the first line of the processed array.
// `shift()` removes the first element from `arr` and returns it.
// Then, it's split by space and each part is converted to a Number.
var nm = arr . shift() . split( " " ) . map( Number );

// Assign N (number of rows) from the parsed dimensions.
var n = nm[ 0 ];

// Assign M (number of columns) from the parsed dimensions.
var m = nm[ 1 ];

// This array will store the counts of each color that needs to be changed
// for each row to match the target color (White, Blue, Red).
var wbr = arr . map( function( v ) {
   // Initialize color counts for the current row: [white_cost, blue_cost, red_cost]
   // Initially, assume all cells need to be changed to each color.
   var color = [ m , m , m ];

   // Iterate through each character (color) in the current row.
   for ( var i = 0 ;  i < m ;  i++ ) {
      // Decrement the cost for the actual color found in the cell.
      // This means if a cell is '0' (White), we don't need to change it to White, so white_cost decreases.
      color[ v[ i ] ] -- ;
   }
   return color; // Return the calculated color cost array for this row.
} ); /* End of the map function block for processing 'arr' into 'wbr' */


// Initialize the minimum cost to a sufficiently large value.
// 2500 is chosen as a large enough number given typical constraints.
var min = 2500 ;

// Outer loop: iterates through possible positions for the first horizontal dividing line.
// 'i' represents the last row of the 'white' segment.
for ( var i = 1 ;  i < n - 2 ;  i++ )
{
   // Inner loop: iterates through possible positions for the second horizontal dividing line.
   // 'j' represents the last row of the 'blue' segment.
   for ( var j = i + 1 ;  j < n - 1 ;  j++ )
   {
      // Initialize the cost for the current combination of 'i' and 'j'.
      var cost = 0 ;

      // Temporary variables used for iterating through rows for cost calculation.
      var a = i ;
      var b = j ;

      // Calculate cost for the top segment (rows 0 to 'i'), which should ideally be 'white' (color 0).
      while ( a >= 0 )
      {
         cost += wbr[ a ][ 0 ] ; // Add the cost to change row 'a' to 'white'.
         a -- ; // Move to the previous row.
      }

      // Calculate cost for the middle segment (rows 'i' to 'j'), which should ideally be 'blue' (color 1).
      for ( var y = i ;  y < j ;  y++ ) {
          cost += wbr[ y ][ 1 ] ; // Add the cost to change row 'y' to 'blue'.
      }

      // Calculate cost for the bottom segment (rows 'j' to N-1), which should ideally be 'red' (color 2).
      while ( b != n - 1 )
      {
         cost += wbr[ b ][ 2 ] ; // Add the cost to change row 'b' to 'red'.
         b ++ ; // Move to the next row.
      }
      // After calculating the cost for the current (i, j) partition, update the minimum.
      min = Math . min( min , cost ) ;
   } // End of inner loop for 'j'.
} // End of outer loop for 'i'.

// Output the final calculated minimum cost to the console.
console . log( min );

// End of JavaScript code execution.