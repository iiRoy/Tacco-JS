/*
 * This JavaScript code processes input to determine geometric properties.
 * It's designed to read coordinate data from standard input,
 * calculate the center and radius of a circle defined by three points,
 * and then output these calculated values.
 */


// Begin by requiring the 'fs' (file system) module for input operations.
require ( "fs" )


  // Read the entire content of standard input synchronously.
  . readFileSync ( "/dev/stdin" , "utf8" )


  // Trim any leading or trailing whitespace from the input string.
  . trim ( )


  // Split the trimmed string into an array of lines, using the newline character as a delimiter.
  . split ( '\n' )


  // Iterate over each line of input using the 'some' array method.
  // The 'some' method will stop iteration and return true if the callback returns true,
  // otherwise it processes all elements and returns false.
  . some ( function ( i ) {

    // Inside the callback function for each line 'i':

    // Split the current line 'i' by space characters to get individual data points.
    // Assign the resulting array to variable 'j'.
    j = i . split ( ' ' ) ;


    // Check if the second element of 'j' exists.
    // This acts as a simple check to ensure the line contains at least two space-separated values,
    // which is a prerequisite for having enough coordinates.
    if ( j [ 1 ] ) {

      // If the line is valid, parse the coordinate values and assign them to variables.
      // These variables represent the x and y coordinates of three distinct points:
      // (a, b), (c, d), and (e, f).
      a = j [ 0 ] , // x-coordinate of the first point
      b = j [ 1 ] , // y-coordinate of the first point
      c = j [ 2 ] , // x-coordinate of the second point
      d = j [ 3 ] , // y-coordinate of the second point
      e = j [ 4 ] , // x-coordinate of the third point
      f = j [ 5 ] ; // y-coordinate of the third point


      // Calculate the squares of each coordinate component.
      // These squared values (g, h, k, l, m, n) are used to simplify the subsequent formulas
      // for the circle's center coordinates.
      g = a * a , // a squared
      h = b * b , // b squared
      k = c * c , // c squared
      l = d * d , // d squared
      m = e * e , // e squared
      n = f * f ; // f squared


      // Calculate 'p', the x-coordinate of the circle's center.
      // This is derived from the general formula for the circumcenter of a triangle.
      p = ( ( b - f ) * ( h - l + g - k ) - ( b - d ) * ( h - n + g - m ) ) /
          ( 2 * ( b - f ) * ( a - c ) - 2 * ( b - d ) * ( a - e ) ) ;


      // Calculate 'q', the y-coordinate of the circle's center.
      // This is also derived from the general formula for the circumcenter.
      q = ( ( a - e ) * ( g - k + h - l ) - ( a - c ) * ( g - m + h - n ) ) /
          ( 2 * ( a - e ) * ( b - d ) - 2 * ( a - c ) * ( b - f ) ) ;


      // Output the results to the console.
      // The output includes:
      // 1. 'p' (x-coordinate of the center), formatted to 3 decimal places.
      // 2. 'q' (y-coordinate of the center), formatted to 3 decimal places.
      // 3. The radius of the circle, also formatted to 3 decimal places.
      //    The radius is calculated using the distance formula between the first point (a,b)
      //    and the calculated center (p,q).
      console . log ( p . toFixed ( 3 ) ,
                      q . toFixed ( 3 ) ,
                      Math . sqrt ( ( a - p ) * ( a - p ) + ( b - q ) * ( b - q ) ) . toFixed ( 3 ) ) ;

    } // End of the 'if (j[1])' block.

    // This callback implicitly returns 'undefined' (which is falsy),
    // ensuring that 'some' continues to iterate through all lines of input.
    // If a 'true' value were returned, 'some' would stop early.

  } ) ; // End of the 'some' method call.


// End of the JavaScript program.