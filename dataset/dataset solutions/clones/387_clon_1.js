/*
 * This JavaScript code defines a recursive function `bomb`
 * and a main program flow to process grid-based problems.
 *
 * The `bomb` function appears to be involved in traversing or modifying a grid,
 * possibly for maze generation or path-finding, using specific movement rules
 * and conditional logic based on cell values.
 */
function bomb ( y , x , z ) {

   // If the current cell at [y][x] is not marked with a plus sign,
   // then we terminate this particular recursive branch.
   if ( yx[y][x] !== "+" )
   {
      return;
   }

   // Define the delta values for the Y (row) coordinate for four directions:
   // Up, Right, Down, Left (corresponding to z = 0, 1, 2, 3).
   var dy = [ -1 , 0 , 1 , 0 ] ;

   // Define the delta values for the X (column) coordinate for four directions:
   // Up, Right, Down, Left (corresponding to z = 0, 1, 2, 3).
   var dx = [ 0 , 1 , 0 , -1 ] ;

   // Calculate the potential next Y coordinate.
   var Y = y + dy[z] ;

   // Calculate the potential next X coordinate.
   var X = x + dx[z] ;


   // Check if the calculated next position (Y, X) is outside the bounds of the grid.
   // The grid size is 'n' x 'n'.
   if ( Y < 0 || X < 0 || Y >= n || X >= n )
   {
      // If out of bounds, change the direction 'z' by rotating clockwise (0->1, 1->2, 2->3, 3->0).
      z = ( z + 1 ) % 4 ;

      // Recursively call the `bomb` function from the current (y, x) position
      // with the newly adjusted direction 'z'.
      bomb( y , x , z ) ;
   }
   else
   {
      // If the next position is within the grid bounds.

      // Check if the cell at the next position [Y][X] is already marked as a path ('#').
      if ( yx[Y][X] === "#" )
      {
         // If the next cell is a path, mark the cell *before* the current one
         // (relative to the direction z) as '+'.
         yx[ Y - dy[z] ][ X - dx[z] ] = "+" ;

         // Based on the current direction 'z', initiate a new recursive call
         // with specific adjusted coordinates and a new starting direction.
         // This complex logic suggests a specific pattern for navigating or modifying the path.
         if ( z === 3 )
         {
            bomb( Y - 2 * dy[z] - 1 , X - 2 * dx[z] , 0 ) ;
         }
         else if ( z === 0 )
         {
            bomb( Y - 2 * dy[z] , X - 2 * dx[z] + 1 , 1 ) ;
         }
         else if ( z === 1 )
         {
            bomb( Y - 2 * dy[z] + 1 , X - 2 * dx[z] , 2 ) ;
         }
         else if ( z === 2 )
         {
            bomb( Y - 2 * dy[z] , X - 2 * dx[z] - 1 , 3 ) ;
         }
      }
      else
      {
         // If the next cell (Y, X) is not a path ('#'), it's likely a '+'.

         // Mark the current cell (y, x) as part of the path ('#').
         yx[y][x] = "#" ;

         // Store the current cell's coordinates in the 'last' array.
         // This might be used for final post-processing.
         last = [ y , x ] ;

         // Recursively call `bomb` for the next position (Y, X),
         // continuing in the same direction 'z'.
         bomb( Y , X , z ) ;
      }
   }
}

// --- Main Program Execution ---

// Read all input from standard input as a string.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;

// Process the input: trim whitespace, split by newlines, and convert each line to a number.
var arr = input . trim() . split( "\n" ) . map( Number ) ;

// The first number in the array 'arr' represents the number of test cases, 'd'.
var d = arr . shift() ;

// Loop through each test case. The 'd--' decrements 'd' and evaluates to its original value,
// continuing the loop until 'd' becomes 0.
while ( d-- ) {

   // For each test case, the next number in 'arr' is 'n', which is the size of the square grid.
   var n = arr . shift() ;

   // Handle a special case: if the grid size 'n' is 0.
   if ( n === 0 )
   {
      console.log( "" ) ; // Print an empty line.
      continue ; // Skip to the next test case.
   }

   // Handle another special case: if the grid size 'n' is 1.
   if ( n === 1 )
   {
      console.log( "#" ) ; // Print a single '#' character.
      continue ; // Skip to the next test case.
   }

   // Handle yet another special case: if the grid size 'n' is 2.
   if ( n === 2 )
   {
      console.log( "##\n# " ) ; // Print a specific 2x2 pattern.
      continue ; // Skip to the next test case.
   }


   // Initialize a 2D array (grid) named 'yx'.
   var yx = [] ;

   // Populate the 'yx' grid with '+' characters.
   // This effectively creates an 'n' x 'n' grid filled with '+'.
   for ( var i = 0 ; i < n ; i++ )
   {
      yx[i] = [] ; // Create a new row.
      for ( var j = 0 ; j < n ; j++ )
      {
         yx[i][j] = "+" ; // Fill each cell in the row with '+'.
      }
   }


   // 'last' is an array that will store the coordinates [y, x] of the last cell
   // modified by the `bomb` function.
   var last = [] ;

   // Initiate the recursive `bomb` function.
   // It starts from the bottom-left corner of the grid (n-1, 0)
   // with an initial direction 'z' of 0 (which typically means 'up').
   bomb( n - 1 , 0 , 0 ) ;


   // Post-processing step: If 'n' (grid size) is an even number,
   // change the value of the cell stored in 'last' back to '+'.
   // This seems to be a final adjustment rule specific to even-sized grids.
   if ( n % 2 === 0 )
   {
      yx[ last[0] ][ last[1] ] = "+" ;
   }

   // Prepare the final grid for output.
   // 1. Join all rows of the 'yx' grid with newline characters.
   // 2. Remove any commas that might result from the array-to-string conversion (e.g., [1,2,3].join('\n') will be '1,2,3').
   // 3. Replace all '+' characters in the string with spaces.
   // 4. Print the resulting string to the console.
   console.log( yx . join( "\n" ) . replace( /,/g , "" ) . replace( /\+/g , " " ) ) ;

}