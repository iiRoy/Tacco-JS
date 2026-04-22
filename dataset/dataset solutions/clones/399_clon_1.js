function      count(   y ,x )
{
   // This function calculates the maximum consecutive '1's starting from (y, x)
   // in 4 specific directions (horizontal, diagonal, vertical).

   /*
    * dy and dx define the directional vectors for checking adjacent cells.
    * dy[0]=0, dx[0]=1  -> Horizontal (right)
    * dy[1]=1, dx[1]=-1 -> Diagonal (down-left)
    * dy[2]=1, dx[2]=0  -> Vertical (down)
    * dy[3]=1, dx[3]=1  -> Diagonal (down-right)
    */
   var    dy = [ 0, 1, 1, 1 ];
   var    dx = [ 1, -1, 0, 1 ];


   var    max = 1; /* Initialize max count of consecutive '1's found so far. */


   // Loop through each of the four predefined directions.
   for ( var i = 0 ; i < 4 ; i ++ )
   {
      var    cnt = 1; // Current consecutive count for the direction.

      // Inner loop to extend in the current direction.
      for ( var j = 1 ; j <= n ; j ++ )
      {
         // Calculate the coordinates of the next cell in the current direction.
         var    yy = y + ( dy[ i ] * j );
         var    xx = x + ( dx[ i ] * j );

         // Check if the calculated coordinates are out of bounds.
         if ( yy < 0 || xx < 0 || yy >= n || xx >= n )
         {
            break; // Stop if out of bounds.
         }

         // Check if the cell value is not '1'.
         if ( yx[ yy ][ xx ] != 1 )
         {
            break; // Stop if the sequence of '1's is broken.
         }

         cnt ++; // Increment the count if it's a '1' and within bounds.
      }

      // Update the overall maximum count.
      max = Math.max( max , cnt );

      // Reset the current count for the next direction.
      cnt = 1;
   }

   return max; // Return the maximum consecutive '1's found.
}


// --- Main program execution starts here ---

/*
 * Read the entire input from /dev/stdin.
 * The input is assumed to be a series of lines.
 */
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' );

// Trim whitespace from the input and split it into an array of lines.
var Arr = ( input . trim( ) ) . split( "\n" );

// Process input lines until a '0' is encountered for 'n'.
while ( true )
{
   /*
    * Shift the first element from Arr, convert it to a number (the '-0' trick),
    * and assign it to 'n'. This 'n' represents the grid size.
    */
   var    n = Arr . shift( ) - 0;

   // If n is 0, it signals the end of input, so break the loop.
   if ( n == 0 )
   {
      break;
   }

   // Initialize an empty array to store the grid.
   var    yx = [ ];

   // Populate the 'yx' grid based on the next 'n' lines of input.
   for ( var i = 0 ; i < n ; i ++ )
   {
      // Shift a line, split it into characters, and map each character to a Number.
      yx[ i ] = ( Arr . shift( ) ) . split( "" ) . map( Number );
   }

   // Initialize the maximum count of consecutive '1's for the current grid.
   var    max = 0;

   // Iterate through each cell of the 'yx' grid.
   for ( var i = 0 ; i < n ; i ++ )
   {
      for ( var j = 0 ; j < n ; j ++ )
      {
         // If a cell contains '1', call the 'count' function to find
         // the maximum consecutive '1's starting from this cell.
         if ( yx[ i ][ j ] == 1 )
         {
            max = Math . max( max , count( i , j ) );
         }
      }
   }

   // Print the maximum count found for the current grid.
   console . log( max );
}