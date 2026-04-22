/*
 * This file contains a JavaScript solution to a geometric problem.
 * It calculates the radius of the minimum enclosing circle for a set of points.
 * The solution considers cases for two points and multiple points.
 */
function Main
(
  input // The input string containing problem data.
)
{

  // Split the input string by newline characters to get an array of lines.
  input  =  input . split ( "\n" ) ;


  // Parse the first line to get the number of points, N.
  var N  =  parseInt ( input [ 0 ] ) ;

  // Remove the first line (which contained N) from the input array.
  input . shift ( ) ;


  // Remove any extra lines beyond N points if present.
  input . splice ( N , input . length ) ;


  // Map the remaining input lines to an array of coordinate pairs.
  // Each line is split by space, and each part is parsed as an integer.
  var x  =  input . map (
    i  =>  i . split ( " " ) . map (
      i  =>  parseInt ( i )
    )
  ) ;


  // Initialize the answer variable.
  var ans = 0 ;

  // --- Handling the base case: only two points ---
  if
  (
    x . length  ==  2
  )
  {
    // If there are only two points, the minimum enclosing circle's diameter
    // is the distance between these two points.
    // The radius is half of this distance.
    var ans  =  Math . sqrt (
      Math . pow ( x [ 0 ] [ 0 ] - x [ 1 ] [ 0 ] , 2 )  +
      Math . pow ( x [ 0 ] [ 1 ] - x [ 1 ] [ 1 ] , 2 )
    ) / 2 ;
  }
  else
  {
    // --- General case: three or more points ---
    // Iterate through all possible combinations of three points (i, j, k)
    // to find the circumcircle or a circle defined by two points.
    for
    (
      var i = 0 ;
      i < N ;
      i++
    )
    {

      for
      (
        var j = i + 1 ;
        j < N ;
        j++
      )
      {

        for
        (
          var k = j + 1 ;
          k < N ;
          k++
        )
        {
          // Calculate squared distances between pairs of points (i, j), (i, k), (j, k).
          // These represent the squared lengths of the sides of the triangle formed by points i, j, k.
          var edge  =  new Array ( ) ;

          // Squared distance between point i and point j
          edge . push ( [ Math . pow ( x [ i ] [ 0 ] - x [ j ] [ 0 ] , 2 ) + Math . pow ( x [ i ] [ 1 ] - x [ j ] [ 1 ] , 2 ) , 0 ] ) ;
          // Squared distance between point i and point k
          edge . push ( [ Math . pow ( x [ i ] [ 0 ] - x [ k ] [ 0 ] , 2 ) + Math . pow ( x [ i ] [ 1 ] - x [ k ] [ 1 ] , 2 ) , 1 ] ) ;
          // Squared distance between point k and point j
          edge . push ( [ Math . pow ( x [ k ] [ 0 ] - x [ j ] [ 0 ] , 2 ) + Math . pow ( x [ k ] [ 1 ] - x [ j ] [ 1 ] , 2 ) , 2 ] ) ;

          // Sort the edges in descending order of their squared lengths.
          // This helps identify the longest side.
          edge . sort (
            function ( a , b )
            {
              return b [ 0 ] - a [ 0 ]
            }
          ) ;

          // Check if the triangle is obtuse or right-angled.
          // If the square of the longest side is greater than the sum of the squares of the other two sides,
          // it's an obtuse triangle, and the minimum enclosing circle has the longest side as its diameter.
          if
          (
            edge [ 0 ] [ 0 ]  >  edge [ 1 ] [ 0 ]  +  edge [ 2 ] [ 0 ]
          )
          {
            // Case 1: Obtuse triangle. The diameter of the MEC is the longest edge.
            // Determine which pair of points forms the longest edge.
            if
            (
              edge [ 0 ] [ 1 ]  ==  0 // Longest edge is between i and j
            )
            {
              var cx  =  ( x [ i ] [ 0 ]  +  x [ j ] [ 0 ] ) / 2 ; // Center X
              var cy  =  ( x [ i ] [ 1 ]  +  x [ j ] [ 1 ] ) / 2 ; // Center Y
              // Squared radius is squared distance from one endpoint to the center.
              var r2  =  Math . pow ( x [ i ] [ 0 ] - cx , 2 )  +  Math . pow ( x [ i ] [ 1 ] - cy , 2 ) ;
            }
            else if
            (
              edge [ 0 ] [ 1 ]  ==  1 // Longest edge is between i and k
            )
            {
              var cx  =  ( x [ i ] [ 0 ]  +  x [ k ] [ 0 ] ) / 2 ;
              var cy  =  ( x [ i ] [ 1 ]  +  x [ k ] [ 1 ] ) / 2 ;
              var r2  =  Math . pow ( x [ i ] [ 0 ] - cx , 2 )  +  Math . pow ( x [ i ] [ 1 ] - cy , 2 ) ;
            }
            else
            { // Longest edge is between j and k
              var cx  =  ( x [ j ] [ 0 ]  +  x [ k ] [ 0 ] ) / 2 ;
              var cy  =  ( x [ j ] [ 1 ]  +  x [ k ] [ 1 ] ) / 2 ;
              var r2  =  Math . pow ( x [ j ] [ 0 ] - cx , 2 )  +  Math . pow ( x [ j ] [ 1 ] - cy , 2 ) ;
            }
          }
          else
          {
            // Case 2: Acute or right-angled triangle.
            // The minimum enclosing circle is the circumcircle of the triangle.
            // Calculate the circumcenter (cx, cy) and squared radius (r2).
            // These are derived from the equations of perpendicular bisectors.

            var cy  =  (
              ( x [ k ] [ 0 ] - x [ i ] [ 0 ] ) * ( Math . pow ( x [ i ] [ 0 ] , 2 ) + Math . pow ( x [ i ] [ 1 ] , 2 ) - Math . pow ( x [ j ] [ 0 ] , 2 ) - Math . pow ( x [ j ] [ 1 ] , 2 ) )
              - ( x [ j ] [ 0 ] - x [ i ] [ 0 ] ) * ( Math . pow ( x [ i ] [ 0 ] , 2 ) + Math . pow ( x [ i ] [ 1 ] , 2 ) - Math . pow ( x [ k ] [ 0 ] , 2 ) - Math . pow ( x [ k ] [ 1 ] , 2 ) )
            ) / (
              2 * ( x [ k ] [ 0 ] - x [ i ] [ 0 ] ) * ( x [ i ] [ 1 ] - x [ j ] [ 1 ] )
              - 2 * ( x [ j ] [ 0 ] - x [ i ] [ 0 ] ) * ( x [ i ] [ 1 ] - x [ k ] [ 1 ] )
            ) ;

            // Calculate cx based on which points are distinct in x-coordinate
            if
            (
              x [ i ] [ 0 ]  !=  x [ j ] [ 0 ]
            )
            {
              var cx  =  (
                ( 2 * x [ i ] [ 1 ] - x [ j ] [ 1 ] ) * cy
                - Math . pow ( x [ i ] [ 0 ] , 2 ) - Math . pow ( x [ i ] [ 1 ] , 2 )
                + Math . pow ( x [ j ] [ 0 ] , 2 ) + Math . pow ( x [ j ] [ 1 ] , 2 )
              ) / ( 2 * ( x [ j ] [ 0 ] - x [ i ] [ 0 ] ) ) ;
            }
            else
            {
              var cx  =  (
                ( 2 * x [ i ] [ 1 ] - x [ k ] [ 1 ] ) * cy
                - Math . pow ( x [ i ] [ 0 ] , 2 ) - Math . pow ( x [ i ] [ 1 ] , 2 )
                + Math . pow ( x [ k ] [ 0 ] , 2 ) + Math . pow ( x [ k ] [ 1 ] , 2 )
              ) / ( 2 * ( x [ k ] [ 0 ] - x [ i ] [ 0 ] ) ) ;
            }
            // Calculate the squared radius from one of the points to the circumcenter.
            var r2  =  Math . pow ( x [ i ] [ 0 ] - cx , 2 )  +  Math . pow ( x [ i ] [ 1 ] - cy , 2 ) ;
          }

          // Check if all other points are contained within this candidate circle.
          var flag = 0 ; // Flag to indicate if any point is outside the circle.
          for
          (
            var l = 0 ;
            l < N ;
            l++
          )
          {
            // If the squared distance from point 'l' to the center (cx, cy)
            // is greater than the squared radius (r2), then point 'l' is outside.
            if
            (
              Math . pow ( x [ l ] [ 0 ] - cx , 2 )  +  Math . pow ( x [ l ] [ 1 ] - cy , 2 )  >  r2
            )
            {
              flag  =  1 ; // Set flag to 1, indicating a point is outside.
              break ;    // No need to check further points for this circle.
            }
          }

          // If all points are inside or on the circle (flag is still 0),
          // then this is a valid minimum enclosing circle.
          if
          (
            flag  ==  0
          )
          {
            ans  =  Math . sqrt ( r2 ) ; // Store the radius as the answer.
            break ;                       // Found the MEC, exit the innermost loop.
          }
        }
        // If an answer was found in the inner loop, break out of the middle loop.
        if
        (
          ans  !=  0
        )
        {
          break ;
        }
      }
      // If an answer was found, break out of the outermost loop.
      if
      (
        ans  !=  0
      )
      {
        break ;
      }
    }
  }

  // Output the calculated answer to the console.
  console . log ( '%s' , ans ) ;
  // Return the result.
  return ans ;
}

/*
 * This debug function is likely for local testing in a web environment.
 * It reads input from a text area, calls Main, and displays the result.
 */
function debug
(
  n // Identifier for the input/output elements.
)
{
  // Get input value from a specific HTML element.
  var input  =  document . getElementById ( "input" + n ) . value ;
  // Call the main function with the retrieved input.
  var ans  =  Main ( input ) ;
  // Initialize result as "WA" (Wrong Answer).
  var result = "WA" ;
  // Compare the calculated answer with the expected output from another HTML element.
  if
  (
    ans  ==  document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ]
  )
  {
    result = "AC" ; // Set result to "AC" (Accepted) if they match.
  }
  // Display the result in a designated HTML element.
  document . getElementById ( "result" + n ) . innerHTML  =  result ;
}

// Entry point for execution in a typical competitive programming environment (Node.js).
// Reads input from standard input, then calls the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;