/*
 * This is an extensively modified Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain absolutely unchanged.
 *
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * altered to create a visually different but functionally identical program.
 */


function   Main ( input )
{
  // The input string is first split into an array of lines.
  input = input . split ( "\n" ) ;

  /*
   * The first line of input (index 0) contains the integer N.
   * We parse it to ensure it's treated as a number.
   */
  const N = parseInt ( input [ 0 ] , 10 ) ;


  // Initialize arrays to store the x and y coordinates.
  var x = [ ] ;

  var y = [ ] ;


  /*
   * Loop through the remaining input lines, starting from index 1 up to N,
   * to populate the x and y coordinate arrays.
   */
  for ( var i = 1 ; i <= N ; i ++ )
  {
    // Each line is split by space, and then each part is parsed as an integer.
    tmp = input [ i ] . split ( " " ) . map ( n => parseInt ( n , 10 ) ) ;

    // The first parsed number is the x-coordinate.
    x . push ( tmp [ 0 ] ) ;

    // The second parsed number is the y-coordinate.
    y . push ( tmp [ 1 ] ) ;
  }


  // This array will store the "dominance" counts for each point.
  var counts = [ ] ;


  /*
   * This outer loop iterates through each point (j) to compare it
   * with all other points (k).
   */
  for ( var j = 0 ; j < N ; j ++ )
  {
    // Initialize a counter for the current point's dominance.
    var count = 0 ;

    /*
     * The inner loop compares the current point (j) with every other point (k).
     * Note: This includes comparing a point with itself, though the condition
     * will prevent `count` from incrementing in that case.
     */
    for ( var k = 0 ; k < N ; k ++ )
    {
      /*
       * Check if point j dominates point k OR if point k dominates point j.
       * A point (x1, y1) dominates (x2, y2) if x1 > x2 AND y1 > y2.
       * Conversely, (x2, y2) dominates (x1, y1) if x2 > x1 AND y2 > y1.
       */
      if ( ( x [ j ] > x [ k ] && y [ j ] > y [ k ] ) || ( x [ j ] < x [ k ] && y [ j ] < y [ k ] ) )
      {
        // If a dominance relationship exists, increment the counter.
        count ++ ;
      }
    }
    // Store the final count for point j, ensuring it's an integer.
    counts . push ( parseInt ( count , 10 ) )
  }


  /*
   * This final set of nested loops calculates and prints the final result
   * for each point based on the pre-calculated dominance counts.
   */
  for ( var j = 0 ; j < N ; j ++ )
  {
    // Initialize the final count for the current point, starting at 1.
    var count = 1 ;

    /*
     * Iterate through all other points (k) to aggregate the dominance counts.
     */
    for ( var k = 0 ; k < N ; k ++ )
    {
      /*
       * Again, check for a dominance relationship between point j and point k.
       * If one exists, add the pre-calculated dominance count of point k
       * to the current point's running total.
       */
      if ( ( x [ j ] > x [ k ] && y [ j ] > y [ k ] ) || ( x [ j ] < x [ k ] && y [ j ] < y [ k ] ) )
      {
        count = count + counts [ k ] ;
      }
    }
    // Print the final aggregated count for point j.
    console . log ( count ) ;
  }
}

/*
 * This section handles reading input from standard input (stdin)
 * and then calls the Main function with that input.
 * It's common in competitive programming environments.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;