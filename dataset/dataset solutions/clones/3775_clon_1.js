/*
 * Main function to process input and solve the problem.
 * This function takes a string 's' as input, which represents the raw data.
 */
function Main ( s )
{
  // --- Input Parsing Section ---

  // Split the input string into an array of lines.
  // Each element of 's' will now be a line from the input.
  s = s . split ( "\n" ) ;

  // Process the first line of the input.
  // It contains two space-separated integers: n and c.
  // 'map(a=>+a)' converts string numbers to actual numbers.
  s [ 0 ] = s [ 0 ] . split ( " " ) . map ( a => + a ) ;

  // Extract 'n' (number of rows/columns in the grid) from the first line.
  var n = s [ 0 ] [ 0 ] ;

  // Extract 'c' (number of colors) from the first line.
  var c = s [ 0 ] [ 1 ] ;

  // Initialize two arrays: 'd' for color costs and 'a' for the grid colors.
  var d = [ ] , a = [ ] ;

  /*
   * Loop to populate the 'd' array (color costs).
   * 'd' will store the cost of changing color 'l' to color 'i'.
   * The input lines for 'd' start from s[1] up to s[c].
   */
  for ( var i = 0 ; i < c ; i ++ ) {
    // Each line contains 'c' space-separated integers.
    // Convert them to numbers and store in d[i].
    d [ i ] = s [ i + 1 ] . split ( " " ) . map ( a => + a ) ;
  } // End of loop for 'd' array population.

  /*
   * Loop to populate the 'a' array (grid colors).
   * 'a' represents the actual grid with its initial colors.
   * The input lines for 'a' start from s[c+1] up to s[c+n].
   */
  for ( i = 0 ; i < n ; i ++ ) {
    // Each line contains 'n' space-separated integers.
    // Convert them to numbers and subtract 1 to make them 0-indexed.
    a [ i ] = s [ i + 1 + c ] . split ( " " ) . map ( a => + a - 1 ) ;
  } // End of loop for 'a' array population.

  // --- Core Logic Section ---

  // Initialize a 3x'c' 2D array 'z' with zeros.
  // 'z[t][color]' will store the count of cells that should have (i+j)%3 == t
  // and currently have 'color'.
  var z = Array ( 3 ) . fill ( 0 ) . map ( a => Array ( c ) . fill ( 0 ) ) ;

  /*
   * Nested loops to calculate the counts for 'z'.
   * This categorizes each cell (i, j) based on (i+j)%3.
   */
  for ( i = 0 ; i < n ; i ++ ) // Outer loop for rows.
  for ( var j = 0 ; j < n ; j ++ ) { // Inner loop for columns.
    // Calculate the 'type' of the cell based on (row + column) modulo 3.
    var t = ( i + j ) % 3 ;

    // Increment the counter for the specific type 't' and the cell's current color.
    z [ t ] [ a [ i ] [ j ] ] ++ ;
  } // End of nested loops for 'z' array population.

  // Initialize 'ans' with a very large number to find the minimum cost.
  // 9e9 is a common way to represent a large number (9 * 10^9).
  var ans = 9e9 ;

  /*
   * Triple nested loops to try all possible combinations of three distinct colors.
   * i: color for cells where (row+col)%3 == 0
   * j: color for cells where (row+col)%3 == 1
   * k: color for cells where (row+col)%3 == 2
   */
  for ( i = 0 ; i < c ; i ++ ) { // Loop for the first color choice (for type 0).
    for ( j = 0 ; j < c ; j ++ ) { // Loop for the second color choice (for type 1).
      // Ensure the second color is different from the first.
      if ( i === j ) continue ;

      for ( var k = 0 ; k < c ; k ++ ) { // Loop for the third color choice (for type 2).
        // Ensure the third color is different from the first and second.
        if ( i === k || j === k ) continue ;

        // Initialize temporary cost for this color combination.
        t = 0 ;

        /*
         * Loop through all original colors (l) to calculate the total cost
         * for this specific (i, j, k) color combination.
         */
        for ( var l = 0 ; l < c ; l ++ ) {
          // Add cost for changing original color 'l' to color 'i' for type 0 cells.
          t += z [ 0 ] [ l ] * d [ l ] [ i ] ;

          // Add cost for changing original color 'l' to color 'j' for type 1 cells.
          t += z [ 1 ] [ l ] * d [ l ] [ j ] ;

          // Add cost for changing original color 'l' to color 'k' for type 2 cells.
          t += z [ 2 ] [ l ] * d [ l ] [ k ] ;
        } // End of innermost loop for calculating 't'.

        // Update the minimum answer found so far.
        ans = Math . min ( ans , t ) ;
      } // End of loop for 'k'.
    } // End of loop for 'j'.
  } // End of loop for 'i'.

  // --- Output Section ---

  // Print the final minimum cost to the console.
  console . log ( ans ) ;
} // End of Main function.

// Call the Main function with input read from stdin.
// 'require("fs").readFileSync("/dev/stdin","utf8")' reads the entire file synchronously.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;