/*
 * This is a JavaScript code snippet.
 * It appears to be processing a 2D grid, possibly for a game or puzzle.
 * The 'seach' function calculates a value based on adjacent cells.
 */
function seach ( y , x ) { // Function to search and update a cell value
   // Check if the current cell is a special character (e.g., a mine)
   if ( yx [ y ] [ x ] == "*" ) {
      yx [ y ] [ x ] = 0 ; // Set its value to 0
      return ; // Exit the function
   }


   /*
    * Define relative offsets for 'dy' (delta y) and 'dx' (delta x).
    * These likely represent directions to check neighboring cells.
    * The specific values (-1,-1,0) for dy and (-1,0,-1) for dx
    * suggest checking cells to the top-left, top-middle, and middle-left.
    * This implies a specific pattern for calculating the value.
    */
   var dy = [ -1 , -1 , 0 ] ;
   var dx = [ -1 , 0 , -1 ] ;

   // Initialize 'min' with a large value, 'n' is likely the grid size
   var min = n ;

   // Loop through the defined directions
   for ( var i = 0 ; i < 3 ; i ++ ) {
      // Calculate coordinates of the neighboring cell
      var yy = y + dy [ i ] ;
      var xx = x + dx [ i ] ;

      // Check if the neighboring cell is out of bounds
      if ( yy < 0 || yy >= n || xx < 0 || xx >= n ) {
         yx [ y ] [ x ] = 1 ; // If out of bounds, set current cell to 1
         return ; // And exit
      }

      // Update 'min' with the minimum value found among neighbors
      min = Math . min ( min , yx [ yy ] [ xx ] ) ;
   }

   // Set the current cell's value based on the calculated minimum
   yx [ y ] [ x ] = min + 1 ;
}



/*
 * Main execution block of the script.
 * Reads input, processes it, and prints results.
 */
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;

// Loop indefinitely until an explicit break condition is met
while ( true ) {

   // Read the grid size 'n' from the input array
   var n = Arr . shift ( ) - 0 ;

   // If 'n' is 0, it signifies the end of input
   if ( n == 0 ) {
      break ; // Exit the while loop
   }

   var max = 0 ; // Initialize maximum value found in the grid
   var yx = [ ] ; // Initialize an empty array to store the grid

   // Populate the grid 'yx' from the input
   for ( var i = 0 ; i < n ; i ++ ) {
      var str = Arr . shift ( ) ; // Get a row string
      yx . push ( str . split ( "" ) ) ; // Split it into characters and add to grid
   }

   // Iterate through each cell of the grid
   for ( var y = 0 ; y < n ; y ++ ) {
      for ( var x = 0 ; x < n ; x ++ ) {
         seach ( y , x ) ; // Call the 'seach' function for the current cell
         max = Math . max ( max , yx [ y ] [ x ] ) ; // Update the overall maximum
      }
   }

   // Print the calculated maximum value for the current grid
   console . log ( max ) ;
}