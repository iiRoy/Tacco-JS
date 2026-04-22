/*
 * This JavaScript code processes input data
 * to calculate a specific 'nolike' value based on
 * a grid and a permutation array.
 *
 * The main function 'Main' takes the input string.
 */
function Main( input ) {

  // Step 1: Pre-process the raw input string
  // It removes leading/trailing whitespace and splits by newline character.
  input=input.trim() .split("\n") ;


  // Step 2: Parse essential parameters from the processed input.
  var N = parseInt( input [0] , 10 ) ; // N represents the dimension of the square grid.
  var PArr = input[1] .split(" ") .map( ( n ) => parseInt(n, 10 ) ) ;
  // PArr is a permutation array, derived from the second line of input.

  var zaseki = new Array( N ) ; // Initialize the main grid 'zaseki'.
  var nolike = 0 ; // This variable accumulates the final result.

  // Step 3: Initialize each row of the 'zaseki' 2D array.
  // Each element will eventually hold a unique number representing a seat.
  for ( var x = 0 ; x < N ; x++ )
  {
    zaseki [ x ] = new Array( N ) ; // Create a new row (inner array).
  }


  var data = { } ; // 'data' will store coordinates for each seat number.

  /*
   * Step 4: Populate the 'zaseki' grid with seat numbers
   * and simultaneously fill the 'data' object
   * with mappings from seat number to its (row, column) coordinates.
   */
  for ( var i = 1 ; i <= N ; i++ ) {

    for ( var j = 1 ; j <= N ; j++ ) {

      // Calculate the unique seat number for the current (i, j) position.
      var num = (i - 1) * N + 1 + (j - 1) ;

      zaseki[ i - 1 ] [ j - 1 ] = num ; // Assign the seat number to the grid.

      var s = num .toString( 10 ) ; // Convert the number to a string for object key.
      data[ s ] = [ i , j ] ; // Store the coordinates (1-based) in 'data'.
    }
  }


  /*
   * Step 5: Process the PArr permutation.
   * For each element in PArr, find its original position in the grid,
   * mark it as 'taken' (set to 0), and then calculate 'nolike' contributions.
   */
  for ( var i = 1 ; i <= N ; i++ ) {

    for ( var j = 1 ; j <= N ; j++ ) {

      var idx = ( i - 1 ) * N + 1 + ( j - 1 ) - 1 ; // This calculates a 0-based index. //0基準
      var p = PArr [ idx ] ; // Retrieve the seat number from the permutation array. //座席の番号取得

      var id = data [ p ] [ 0 ] ; // Get the 1-based row coordinate of seat 'p'.
      var jd = data [ p ] [ 1 ] ; // Get the 1-based column coordinate of seat 'p'.

      zaseki [ id - 1 ] [ jd - 1 ] = 0 ; // Mark this seat as removed/taken by setting its value to 0.

      // If the current seat is on the border of the grid, it contributes 0 to 'nolike'.
      if ( id == 1 || jd == 1 || id == N || jd == N ) {
        nolike += 0 ; // No contribution from border seats.
        continue ; // Move to the next seat in the permutation.
      }
      else {
        // For non-border seats, calculate available neighbors in four directions.
        var left = 0 ; // Count available seats to the left.
        var right = 0 ; // Count available seats to the right.
        var up = 0 ; // Count available seats upwards.
        var down = 0 ; // Count available seats downwards.

        // Count available seats to the left (decreasing column index).
        for ( var a = id - 1 ; a > 0 ; a-- ) {
          if ( zaseki [ a - 1 ] [ jd - 1 ] != 0 ) left++ ;
        }

        // Count available seats to the right (increasing column index).
        for ( var b = id + 1 ; b <= N ; b++ ) {
          if ( zaseki [ b - 1 ] [ jd - 1 ] != 0 ) right++ ;
        }

        // Count available seats upwards (decreasing row index).
        for ( var c = id - 1 ; c > 0 ; c-- ) {
          if ( zaseki [ id - 1 ] [ c - 1 ] != 0 ) up++ ;
        }

        // Count available seats downwards (increasing row index).
        for ( var d = id + 1 ; d <= N ; d++ ) {
          if ( zaseki [ id - 1 ] [ d - 1 ] != 0 ) down++ ;
        }
      }
      // Add the minimum count of available neighbors in any direction to 'nolike'.
      nolike += Math .min ( left , right , up , down ) ;
    }
  }

  // Step 6: Output the final calculated 'nolike' value to the console.
  console .log ( nolike ) ;
}


/*
 * This line handles reading input from standard input
 * and passes it to the Main function for processing.
 * It's typical for competitive programming environments.
 */
Main ( require("fs") .readFileSync ( "/dev/stdin" , "utf8" ) ) ;