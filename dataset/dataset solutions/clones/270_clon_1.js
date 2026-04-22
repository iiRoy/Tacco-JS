function bomb ( y , x )
{
   // Check if the current number N has reached the maximum allowed value for the square.
   // If it has, we terminate the recursive calls for this branch.
   if ( N == max ) return ;

   // Handle wrapping for the x-coordinate: if it goes below 0, wrap to the end of the row.
   if ( x < 0 )
   {
      x = n - 1 ;
   }

   // Handle wrapping for the y-coordinate: if it goes below 0, wrap to the end of the column.
   if ( y < 0 )
   {
      y = n - 1 ;
   }

   // Handle wrapping for the x-coordinate: if it goes beyond the grid, wrap to the beginning.
   if ( x >= n )
   {
      x = 0 ;
   }

   // Handle wrapping for the y-coordinate: if it goes beyond the grid, wrap to the beginning.
   if ( y >= n )
   {
      y = 0 ;
   }

   // This conditional statement determines where to place the next number in the magic square.
   // If the current cell (y, x) is already occupied (not -1), it means we've encountered a collision.
   // In this case, we need to move to a different position for the next number.
   if ( yx [ y ] [ x ] != -1 )
   {
      // If the cell is occupied, we try the cell one step down and one step left from the *original* position.
      // This is a common rule in some magic square algorithms when a cell is already filled.
      bomb ( y + 1 , x - 1 ) ;
   }
   // If the current cell (y, x) is empty (-1), we can place the current number N here.
   else
   {
      // Format the number N to be a string of length 4, padded with spaces if necessary.
      // This ensures consistent output formatting for the square.
      yx [ y ] [ x ] = ( "   " + N ) . slice ( -4 ) ;

      // Increment N, moving to the next number for the magic square.
      N ++ ;

      // Recursively call bomb for the next position: one step down and one step right.
      // This is the standard movement pattern for filling the magic square.
      bomb ( y + 1 , x + 1 ) ;
   }
}


// --- Main Program Execution Section ---

// Read the entire input from standard input, assuming it's UTF-8 encoded.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input:
// 1. Trim any leading/trailing whitespace.
// 2. Split the string by newline characters to get an array of number strings.
// 3. Map each string to its numerical representation.
var Arr = ( input . trim ( ) ) . split ( "\n" ) . map ( Number ) ;

// Iterate through each number 'n' provided in the input array.
for ( var i = 0 ; i < Arr . length ; i ++ )
{
   // Assign the current input number to 'n'. This 'n' will define the size of the magic square.
   var n = Arr [ i ] ;

   // Calculate the maximum number that will be placed in the magic square.
   // For an n x n square, numbers go from 1 to n*n. 'max' is n*n + 1 to serve as an upper bound check.
   var max = n * n + 1 ;

   // If 'n' is 0, it signifies the end of input or an invalid square size.
   // We break out of the loop in this case.
   if ( n == 0 )
   {
      break ;
   }

   // Initialize an empty array 'yx' which will represent our n x n magic square grid.
   var yx = [ ] ;

   // Populate the 'yx' grid with -1s, indicating empty cells.
   // This is a nested loop to create an n x n 2D array.
   for ( var j = 0 ; j < n ; j ++ )
   {
      // Initialize each row as an empty array.
      yx [ j ] = [ ] ;

      // Fill each cell in the current row with -1.
      for ( var k = 0 ; k < n ; k ++ )
      {
         yx [ j ] [ k ] = -1 ;
      }
   }

   // Initialize 'N' to 1, as this is the first number to be placed in the magic square.
   var N = 1 ;

   // Start the magic square generation process by calling the 'bomb' function.
   // The starting position is typically in the middle of the top row, or slightly adjusted
   // based on specific magic square algorithms (e.g., "Siamese method").
   // Here, it's (floor(n/2)+1, floor(n/2)).
   bomb ( Math . floor ( n / 2 ) + 1 , Math . floor ( n / 2 ) ) ;

   // After the 'bomb' function completes, the 'yx' array contains the filled magic square.
   // Prepare the output:
   // 1. Join rows with newline characters.
   // 2. Replace all commas (which are default array separators in join) with empty strings
   //    to ensure clean, space-padded number output.
   console . log ( yx . join ( "\n" ) . replace ( /\,/g , "" ) ) ;
}