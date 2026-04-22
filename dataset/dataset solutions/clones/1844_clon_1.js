/*
 * This is the main function that processes the input data for the problem.
 * It calculates a specific 'nolike' value based on seat arrangements
 * and a given permutation.
 */
function Main ( input ) {
  // First, process the raw input string.
  // Trim any leading/trailing whitespace and then split it into an array of lines.
  input = input . trim ( ) . split ( "\n" ) ;

  // The first line of input contains the integer N, representing the grid size.
  var N = parseInt ( input [ 0 ] , 10 ) ;

  /*
   * PArr holds the permutation of seat numbers.
   * This array is derived from the second line of the input.
   * It's split by spaces, and each part is converted to an integer.
   */
  var PArr = input [ 1 ] . split ( " " ) . map ( ( n ) => parseInt ( n , 10 ) ) ;

  // Initialize a 2D array (matrix) named 'zaseki' to represent the seating grid.
  // The grid will be N x N in dimensions.
  var zaseki = new Array ( N ) ;

  // 'nolike' is a variable initialized to zero, used to accumulate the final result.
  var nolike = 0 ;

  // Populate each row of the 'zaseki' matrix with a new array, making it N x N.
  for ( var x = 0 ; x < N ; x ++ ) {
    zaseki [ x ] = new Array ( N ) ;
  }

  // 'data' is an object (acting as a hash map) to store the 1-based [row, column]
  // coordinates for each seat number, allowing for quick lookups.
  var data = { } ;

  /*
   * This nested loop initializes the 'zaseki' grid with sequential seat numbers
   * (from 1 to N*N) and simultaneously populates the 'data' map.
   * The loops use 1-based indexing for 'i' (rows) and 'j' (columns).
   */
  for ( var i = 1 ; i <= N ; i ++ ) {
    for ( var j = 1 ; j <= N ; j ++ ) {
      // Calculate the unique seat number for the current (i, j) position.
      // This formula converts 1-based (i, j) to a 1-based sequential number.
      var num = ( i - 1 ) * N + 1 + ( j - 1 ) ;

      // Assign the calculated seat number to the corresponding cell in the 'zaseki' matrix.
      zaseki [ i - 1 ] [ j - 1 ] = num ;

      // Store the 1-based coordinates [i, j] in the 'data' map, keyed by the seat number.
      data [ num ] = [ i , j ] ;
    } // End of inner loop for column 'j'.
  } // End of outer loop for row 'i'.


  /*
   * This is the core logic section. It iterates through each position (i, j)
   * in the grid, processing seats according to the permutation in PArr.
   */
  for ( var i = 1 ; i <= N ; i ++ ) {
    for ( var j = 1 ; j <= N ; j ++ ) {
      // Calculate the 0-based index for accessing the PArr array.
      // The original comment "0基準" means "0-based standard".
      var idx = ( i - 1 ) * N + 1 + ( j - 1 ) - 1 ;

      // Retrieve the actual seat number 'p' from the permutation array PArr
      // at the calculated index. This 'p' represents the seat being processed.
      var p = PArr [ idx ] ; // Get the seat number from the permutation.

      // Use the 'data' map to find the 1-based row and column coordinates
      // (id, jd) corresponding to the seat number 'p'.
      var id = data [ p ] [ 0 ] ; // Row coordinate (1-based).
      var jd = data [ p ] [ 1 ] ; // Column coordinate (1-based).

      // Mark the seat 'p' as "removed" or "taken" by setting its value to 0
      // in the 'zaseki' matrix. This simulates removing the seat.
      zaseki [ id - 1 ] [ jd - 1 ] = 0 ;

      // Check if the current seat (id, jd) is located on any of the grid borders.
      // Border seats are treated differently in this problem's logic.
      if ( id == 1 || jd == 1 || id == N || jd == N ) {
        continue ; // If it's a border seat, skip the rest of the calculations for this iteration.
      }
      else {
        // If the seat is not on the border, initialize counters for available seats
        // in the four cardinal directions relative to the removed seat.
        var left = 0 ;
        var right = 0 ;
        var up = 0 ;
        var down = 0 ;

        // Count available seats to the 'left' (decreasing row index, same column).
        // This loop checks cells (a-1, jd-1) where 'a' goes from 'id' down to 1.
        for ( var a = id ; a > 0 ; a -- ) {
          if ( zaseki [ a - 1 ] [ jd - 1 ] != 0 ) {
            left ++ ;
          }
        }

        // Count available seats to the 'right' (increasing row index, same column).
        // This loop checks cells (b-1, jd-1) where 'b' goes from 'id' up to N.
        for ( var b = id ; b <= N ; b ++ ) {
          if ( zaseki [ b - 1 ] [ jd - 1 ] != 0 ) {
            right ++ ;
          }
        }

        // Count available seats 'up' (decreasing column index, same row).
        // This loop checks cells (id-1, c-1) where 'c' goes from 'id' down to 1.
        for ( var c = id ; c > 0 ; c -- ) {
          if ( zaseki [ id - 1 ] [ c - 1 ] != 0 ) {
            up ++ ;
          }
        }

        // Count available seats 'down' (increasing column index, same row).
        // This loop checks cells (id-1, d-1) where 'd' goes from 'id' up to N.
        for ( var d = id ; d <= N ; d ++ ) {
          if ( zaseki [ id - 1 ] [ d - 1 ] != 0 ) {
            down ++ ;
          }
        }
      } // End of the 'else' block for non-border seats.

      // Add the minimum count among the four directions to 'nolike'.
      // This step is critical for the problem's logic, accumulating the smallest
      // number of available seats in any cardinal direction from the current seat.
      nolike += Math . min ( left , right , up , down ) ;

    } // End of the inner loop for column 'j'.
  } // End of the outer loop for row 'i'.

  // Finally, print the accumulated 'nolike' value to the console.
  console . log ( nolike ) ;

} // End of the Main function definition.

// Call the Main function, providing it with input read from standard input.
// This typically uses Node.js's 'fs' module to read the entire file synchronously.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;