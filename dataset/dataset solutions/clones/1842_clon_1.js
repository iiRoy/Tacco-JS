/*
 * This JavaScript function serves as the main entry point for processing input
 * and performing a specific calculation related to a grid or seating arrangement.
 * It reads configuration from the input, initializes a grid, and then iterates
 * through it to compute a 'nolike' value based on certain conditions.
 */
function   Main (  input )
{
  // First, the input string is cleaned up by removing leading/trailing whitespace,
  // and then split into an array of strings, where each element is a line from the input.
  input = input . trim ( ) . split ( "\n" ) ;


  // The first line of input is parsed as an integer to determine the size of the grid, N.
  var   N = parseInt ( input [ 0 ] ,   10 ) ;


  // The second line of input contains a space-separated list of numbers.
  // This line is split into an array of strings, and then each string is mapped
  // to its integer equivalent, forming the PArr (Permutation Array).
  var   PArr = input [ 1 ] . split ( " " ) . map ( ( n ) => parseInt ( n , 10 ) ) ;


  // A 2D array, 'zaseki' (meaning 'seat' or 'seating' in Japanese), is initialized.
  // It will represent the N x N grid.
  var   zaseki = new   Array ( N ) ;


  // A variable 'nolike' is initialized to zero. This variable will accumulate
  // the final calculated value throughout the program's execution.
  var   nolike = 0 ;


  // This loop initializes each row of the 'zaseki' array with another empty array,
  // effectively creating an N x N matrix (a grid of N rows and N columns).
  for ( var   x = 0 ;   x < N ;   x ++ )
  {
    zaseki [ x ] = new   Array ( N ) ;
  }


  // An empty JavaScript object 'data' is created. This object will be used
  // to store a mapping from seat numbers to their corresponding grid coordinates (i, j).
  var   data = { } ;


  /*
   * This nested loop populates the 'zaseki' grid with sequential numbers
   * and simultaneously builds the 'data' object.
   * 'i' and 'j' represent 1-based row and column indices, respectively.
   */
  for ( var   i = 1 ;   i <= N ;   i ++ )
  {
    for ( var   j = 1 ;   j <= N ;   j ++ )
    {
      // Calculate a unique 'num' for each cell in the grid.
      // This formula ensures sequential numbering from 1 to N*N.
      var   num = ( i - 1 ) * N + 1 + ( j - 1 ) ;

      // Assign the calculated 'num' to the corresponding cell in 'zaseki'.
      // Note that 'zaseki' uses 0-based indexing (i-1, j-1).
      zaseki [ i - 1 ] [ j - 1 ] = num ;

      // Convert the 'num' to a string, 's', to be used as a key in the 'data' object.
      var   s = num . toString ( 10 ) ;

      // Store the 1-based (i, j) coordinates in the 'data' object,
      // with 's' (the seat number as a string) as the key.
      data [ s ] = [ i , j ] ;
    }
  }


  /*
   * This second set of nested loops is the core logic for calculating 'nolike'.
   * It iterates through each cell of the conceptual N x N grid.
   */
  for ( var   i = 1 ;   i <= N ;   i ++ )
  {
    for ( var   j = 1 ;   j <= N ;   j ++ )
    {
      // Calculate the 0-based index for accessing the PArr (permutation array).
      // The original comment '0基準' indicates "0-based standard".
      var   idx = ( i - 1 ) * N + 1 + ( j - 1 ) - 1 ;

      // Retrieve the seat number 'p' from PArr using the calculated index.
      // The original comment '座席の番号取得' means "get seat number".
      var   p = PArr [ idx ] ;

      // Using the seat number 'p', look up its 1-based (row, column) coordinates
      // from the 'data' object. 'id' is the row, 'jd' is the column.
      var   id = data [ p ] [ 0 ] ;
      var   jd = data [ p ] [ 1 ] ;

      // Mark the seat at (id-1, jd-1) in the 'zaseki' grid as 'occupied' or 'processed'
      // by setting its value to 0. This changes the grid state for subsequent checks.
      zaseki [ id - 1 ] [ jd - 1 ] = 0 ;

      // Check if the current seat (id, jd) is located on the border of the N x N grid.
      // If it's on any of the four edges (row 1, column 1, row N, or column N),
      // it contributes 0 to 'nolike', and the processing for this seat is skipped.
      if ( id == 1 || jd == 1 || id == N || jd == N )
      {
        nolike += 0 ; // Adding 0 has no effect, but explicitly done as per original logic.
        continue ;    // Move to the next iteration of the inner loop (next seat).
      }
      else
      {
        // If the seat is not on the border, initialize counters for available
        // (non-zero) seats in four conceptual directions: left, right, up, and down.
        var   left = 0 ;
        var   right = 0 ;
        var   up = 0 ;
        var   down = 0 ;

        // Loop to count available seats to the 'left' of the current seat.
        // It iterates backwards through rows, keeping the column fixed.
        for ( var   a = id - 1 ;   a > 0 ;   a -- )
        {
          if ( zaseki [ a - 1 ] [ jd - 1 ] != 0 )
          {
            left ++ ;
          }
        }

        // Loop to count available seats to the 'right' of the current seat.
        // It iterates forwards through rows, keeping the column fixed.
        for ( var   b = id + 1 ;   b <= N ;   b ++ )
        {
          if ( zaseki [ b - 1 ] [ jd - 1 ] != 0 )
          {
            right ++ ;
          }
        }

        // Loop to count available seats in a direction conceptually referred to as 'up'.
        // This loop iterates on a variable 'c' initialized from 'id - 1',
        // and checks cells in the same row but with decreasing column indices based on 'c'.
        for ( var   c = id - 1 ;   c > 0 ;   c -- )
        {
          if ( zaseki [ id - 1 ] [ c - 1 ] != 0 )
          {
            up ++ ;
          }
        }

        // Loop to count available seats in a direction conceptually referred to as 'down'.
        // This loop iterates on a variable 'd' initialized from 'id + 1',
        // and checks cells in the same row but with increasing column indices based on 'd'.
        for ( var   d = id + 1 ;   d <= N ;   d ++ )
        {
          if ( zaseki [ id - 1 ] [ d - 1 ] != 0 )
          {
            down ++ ;
          }
        }
      } // End of the 'else' block (for non-border seats).

      // After checking all four directions, the minimum count among them is added to 'nolike'.
      nolike += Math . min ( left , right , up , down ) ;
    } // End of the inner loop (j, iterating through columns).
  } // End of the outer loop (i, iterating through rows).


  // Finally, the calculated total 'nolike' value is printed to the console.
  console . log ( nolike ) ;
}


// The Main function is invoked with input read from standard input.
// This line uses Node.js's 'fs' module to synchronously read the entire content
// of '/dev/stdin' as a UTF-8 encoded string, which is then passed to Main.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;