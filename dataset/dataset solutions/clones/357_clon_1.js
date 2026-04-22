function bomb ( y , x , v ) {
   // This function performs a recursive search for connected components.
   // It takes current y-coordinate, x-coordinate, and the value to search for.

   /*
    * Define the changes in y-coordinate for 4 directions:
    * Up, Down, Left, Right (or similar interpretation)
    */
   var dy = [ 0 , 0 , -1 , 1 ] ;

   // Define the changes in x-coordinate for 4 directions.
   var dx = [ -1 , 1 , 0 , 0 ] ;


   // Loop through all four possible directions.
   for ( var i = 0 ; i < 4 ; i ++ ) {

      // Calculate the new y-coordinate.
      var yy = y + dy [ i ] ;

      // Calculate the new x-coordinate.
      var xx = x + dx [ i ] ;

      /*
       * Check if the new coordinates are out of bounds.
       * n[0] is max y, n[1] is max x.
       */
      if ( yy < 0 || yy >= n [ 0 ] || xx < 0 || xx >= n [ 1 ] ) {
         continue ; // If out of bounds, skip to the next direction.
      }


      // If the value at the new coordinate matches the target value 'v'.
      if ( v == yx [ yy ] [ xx ] ) {
         // Mark the current cell as visited/processed ('m').
         yx [ yy ] [ xx ] = "m" ;
         // Recursively call bomb for the new coordinates.
         bomb ( yy , xx , v ) ;
      }

   } // End of for loop for directions.

} // End of bomb function.

// Read the entire input from /dev/stdin as a UTF-8 string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim whitespace from the input and split it into an array of lines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Main loop to process multiple test cases.
while ( true ) {

   // Read the first line of the current test case, split by space, and convert to numbers.
   // This line usually contains the dimensions (n[0] = rows, n[1] = columns).
   var n = ( Arr . shift ( ) ) . split ( " " ) . map ( Number ) ;

   // Check for the termination condition: both dimensions are 0.
   if ( n [ 0 ] == 0 && n [ 1 ] == 0 ) {
      break ; // Exit the loop if dimensions are 0,0.
   }

   // Initialize an empty array to store the grid (map).
   var yx = [ ] ;

   // Populate the grid (yx) based on the input dimensions.
   for ( var i = 0 ; i < n [ 0 ] ; i ++ ) {
      // Read a line, split it into individual characters.
      var arr = ( Arr . shift ( ) ) . split ( "" ) ;
      // Add the character array as a row to the grid.
      yx . push ( arr ) ;
   }


   // Initialize a counter for the number of distinct components.
   var cnt = 0 ;

   // Iterate through each cell of the grid.
   for ( var i = 0 ; i < n [ 0 ] ; i ++ ) {

      for ( var j = 0 ; j < n [ 1 ] ; j ++ ) {

         // Get the value of the current cell.
         var v = yx [ i ] [ j ] ;

         // If the cell contains an unvisited component character.
         if ( v == "@" || v == "#" || v == "*" ) {
            // Increment the component counter.
            cnt ++ ;
            // Mark the current cell as visited ('m').
            yx [ i ] [ j ] = "m" ;
            // Start the recursive 'bomb' function to mark all connected parts.
            bomb ( i , j , v ) ;
         }
      }
   }

   // Print the total count of distinct components for the current test case.
   console . log ( cnt ) ;

} // End of while loop.