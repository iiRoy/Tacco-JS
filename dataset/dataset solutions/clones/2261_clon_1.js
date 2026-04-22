/*
 * This JavaScript code calculates the smallest enclosing circle for a set of points.
 * It's a Type I clone, meaning identifiers and logic are identical,
 * but whitespace and comments have been extensively modified.
 */

function Main ( input ) {
  // Split the input string into an array of lines.
  input = input . split ( "\n" ) ;

  // Parse the first line to get the number of points (N).
  var N = parseInt ( input [ 0 ] ) ;

  // Remove the first line as it's already processed.
  input . shift ( ) ;

  // Trim the input array to contain only N lines of point data.
  input . splice ( N , input . length ) ;

  // Map the input lines to an array of coordinate pairs (x, y).
  // Each point x[i] will be an array [x_coord, y_coord].
  var x = input . map ( i => i . split ( " " ) . map ( i => parseInt ( i ) ) ) ;

  // Initialize the answer variable. This will store the radius of the smallest enclosing circle.
  var ans = 0 ;

  // Outer loop: Iterate through all possible points for the first vertex (i).
  for ( var i = 0 ; i < N ; i ++ ) {
    // Middle loop: Iterate through points after 'i' for the second vertex (j).
    for ( var j = i + 1 ; j < N ; j ++ ) {
      // Inner loop: Iterate through points after 'j' for the third vertex (k).
      for ( var k = j + 1 ; k < N ; k ++ ) {
        /*
         * This section calculates the squared distances between the three chosen points (i, j, k)
         * to form a potential triangle. It then determines if the circle is defined by two points
         * (diameter) or three points (circumcircle).
         */

        var edge = new Array ( ) ; // Stores squared edge lengths and an identifier for the points.

        // Calculate squared distance between point i and point j.
        edge . push ( [ Math . pow ( x [ i ] [ 0 ] - x [ j ] [ 0 ] , 2 ) + Math . pow ( x [ i ] [ 1 ] - x [ j ] [ 1 ] , 2 ) , 0 ] ) ;
        // Calculate squared distance between point i and point k.
        edge . push ( [ Math . pow ( x [ i ] [ 0 ] - x [ k ] [ 0 ] , 2 ) + Math . pow ( x [ i ] [ 1 ] - x [ k ] [ 1 ] , 2 ) , 1 ] ) ;
        // Calculate squared distance between point k and point j.
        edge . push ( [ Math . pow ( x [ k ] [ 0 ] - x [ j ] [ 0 ] , 2 ) + Math . pow ( x [ k ] [ 1 ] - x [ j ] [ 1 ] , 2 ) , 2 ] ) ;

        // Sort the edges in descending order based on their squared lengths.
        // This helps identify the longest edge.
        edge . sort ( function ( a , b ) { return b [ 0 ] - a [ 0 ] } ) ;

        // Check if the triangle formed by (i, j, k) is obtuse or right-angled.
        // If the square of the longest side is greater than the sum of the squares of the other two sides,
        // then the circumcircle's diameter is the longest side.
        if ( edge [ 0 ] [ 0 ] > edge [ 1 ] [ 0 ] + edge [ 2 ] [ 0 ] ) {
          // The circle is defined by two points forming the diameter.
          // Determine which pair of points forms the diameter based on the 'edge' identifier.
          if ( edge [ 0 ] [ 1 ] == 0 ) { // Diameter is between i and j.
            var cx = ( x [ i ] [ 0 ] + x [ j ] [ 0 ] ) / 2 ; // Center x-coordinate
            var cy = ( x [ i ] [ 1 ] + x [ j ] [ 1 ] ) / 2 ; // Center y-coordinate
            var r2 = Math . pow ( x [ i ] [ 0 ] - cx , 2 ) + Math . pow ( x [ i ] [ 1 ] - cy , 2 ) ; // Squared radius
          } else if ( edge [ 0 ] [ 1 ] == 1 ) { // Diameter is between i and k.
            var cx = ( x [ i ] [ 0 ] + x [ k ] [ 0 ] ) / 2 ;
            var cy = ( x [ i ] [ 1 ] + x [ k ] [ 1 ] ) / 2 ;
            var r2 = Math . pow ( x [ i ] [ 0 ] - cx , 2 ) + Math . pow ( x [ i ] [ 1 ] - cy , 2 ) ;
          } else { // Diameter is between j and k.
            var cx = ( x [ j ] [ 0 ] + x [ k ] [ 0 ] ) / 2 ;
            var cy = ( x [ j ] [ 1 ] + x [ k ] [ 1 ] ) / 2 ;
            var r2 = Math . pow ( x [ j ] [ 0 ] - cx , 2 ) + Math . pow ( x [ j ] [ 1 ] - cy , 2 ) ;
          }
        } else {
          // The triangle is acute or right-angled, so the circumcircle is the smallest enclosing circle for these three points.
          // Calculate the circumcenter (cx, cy) and squared circumradius (r2).
          // This uses a formula for the circumcenter of a triangle.
          var cy = ( ( x [ k ] [ 0 ] - x [ i ] [ 0 ] ) * ( Math . pow ( x [ i ] [ 0 ] , 2 ) + Math . pow ( x [ i ] [ 1 ] , 2 ) - Math . pow ( x [ j ] [ 0 ] , 2 ) - Math . pow ( x [ j ] [ 1 ] , 2 ) ) - ( x [ j ] [ 0 ] - x [ i ] [ 0 ] ) * ( Math . pow ( x [ i ] [ 0 ] , 2 ) + Math . pow ( x [ i ] [ 1 ] , 2 ) - Math . pow ( x [ k ] [ 0 ] , 2 ) - Math . pow ( x [ k ] [ 1 ] , 2 ) ) ) / ( 2 * ( x [ k ] [ 0 ] - x [ i ] [ 0 ] ) * ( x [ i ] [ 1 ] - x [ j ] [ 1 ] ) - 2 * ( x [ j ] [ 0 ] - x [ i ] [ 0 ] ) * ( x [ i ] [ 1 ] - x [ k ] [ 1 ] ) ) ;

          // Calculate cx based on cy. Handle vertical lines (x[i][0] == x[j][0]) separately.
          if ( x [ i ] [ 0 ] != x [ j ] [ 0 ] ) {
            var cx = ( ( 2 * x [ i ] [ 1 ] - x [ j ] [ 1 ] ) * cy - Math . pow ( x [ i ] [ 0 ] , 2 ) - Math . pow ( x [ i ] [ 1 ] , 2 ) + Math . pow ( x [ j ] [ 0 ] , 2 ) + Math . pow ( x [ j ] [ 1 ] , 2 ) ) / ( 2 * ( x [ j ] [ 0 ] - x [ i ] [ 0 ] ) ) ;
          } else { // Fallback for when x[i][0] == x[j][0], use x[k] instead of x[j] for cx calculation.
            var cx = ( ( 2 * x [ i ] [ 1 ] - x [ k ] [ 1 ] ) * cy - Math . pow ( x [ i ] [ 0 ] , 2 ) - Math . pow ( x [ i ] [ 1 ] , 2 ) + Math . pow ( x [ k ] [ 0 ] , 2 ) + Math . pow ( x [ k ] [ 1 ] , 2 ) ) / ( 2 * ( x [ k ] [ 0 ] - x [ i ] [ 0 ] ) ) ;
          }

          // Calculate the squared radius from one of the points to the circumcenter.
          var r2 = Math . pow ( x [ i ] [ 0 ] - cx , 2 ) + Math . pow ( x [ i ] [ 1 ] - cy , 2 ) ;
        }

        // Now, check if all other points are contained within this potential smallest enclosing circle.
        var flag = 0 ; // Flag to indicate if a point is outside the circle.
        for ( var l = 0 ; l < N ; l ++ ) {
          // Calculate squared distance from point 'l' to the current circle's center.
          // If any point is outside (distance > radius), then this is not the smallest enclosing circle.
          if ( Math . pow ( x [ l ] [ 0 ] - cx , 2 ) + Math . pow ( x [ l ] [ 1 ] - cy , 2 ) > r2 ) {
            flag = 1 ; // Set flag to 1, indicating failure.
            break ;    // No need to check further points for this circle.
          }
        }

        // If 'flag' is still 0, it means all points are within or on the current circle.
        // This is a candidate for the smallest enclosing circle.
        if ( flag == 0 ) {
          ans = Math . sqrt ( r2 ) ; // Store the radius.
          break ;                    // Break out of the innermost loop (k loop) as we found a solution.
        }
      }
      // If 'ans' is non-zero, it means a valid smallest enclosing circle has been found.
      if ( ans != 0 ) {
        break ; // Break out of the middle loop (j loop).
      }
    }
    // If 'ans' is non-zero, it means a valid smallest enclosing circle has been found.
    if ( ans != 0 ) {
      break ; // Break out of the outermost loop (i loop).
    }
  }

  // Output the calculated radius to the console.
  console . log ( '%s' , ans ) ;
  // Return the result.
  return ans ;
}

/*
 * This 'debug' function is likely for local testing purposes, not part of the core algorithm.
 * It simulates input from HTML elements and checks the output.
 */
function debug ( n ) {
  var input = document . getElementById ( "input" + n ) . value ; // Get input from a text area.
  var ans = Main ( input ) ; // Run the main function.
  var result = "WA" ;        // Default result is "Wrong Answer".

  // Compare the calculated answer with the expected output from an HTML element.
  if ( ans == document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ] ) {
    result = "AC" ; // If they match, it's "Accepted".
  }
  // Display the result in an HTML element.
  document . getElementById ( "result" + n ) . innerHTML = result ;
}

// This line executes the Main function with input read from standard input in a Node.js environment.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;