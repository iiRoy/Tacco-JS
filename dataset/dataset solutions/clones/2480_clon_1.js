/*
 * This function processes input to solve a geometric problem.
 * It calculates an angle based on given dimensions and volume.
 * The problem involves a rectangular prism partially filled with liquid.
 */
function Main ( input ) {
  // Temporary variable to store the parsed input line.
  var    tmp    =    input [ 0 ] . split ( ' ' )   ;

  // Extract dimensions 'a' and 'b', and target volume 'x' from the parsed array.
  var a = tmp [ 0 ] ; // Width of the base.
  var b = tmp [ 1 ] ; /* Height of the prism. */
  var x = tmp [ 2 ] ; // The specified volume of liquid.

  // Calculate the total volume of the rectangular prism.
  var v = a * a * b ;

  // Determine which geometric case applies based on the liquid volume 'x'
  // relative to half the prism's total volume 'v'.
  if ( x >= v / 2 ) {
    /*
     * Case 1: The liquid volume 'x' is greater than or equal to half the total volume.
     * This implies the liquid forms a shape where the empty space is a triangular prism.
     * Calculate the height 'h' of the empty space from the top.
     */
    var h = 2 * ( b - ( x / ( a * a ) ) ) ;

    // Original debug line, kept commented out.
    // console.log("h:%s",h);

    // Calculate the angle 'c' (in radians) using the arctangent function.
    // This angle represents the tilt of the liquid surface.
    var c = Math . atan ( h / a ) ;

    // Another commented-out debug line.
    /* console.log("c:%s",c); */

    // Original commented-out reference to PI.
    // console.log("pi:%s",Math.PI);

    // Convert the angle 'c' from radians to degrees for the final result.
    var result = ( c * 180 ) / Math . PI ;
    console . log ( "%s" , result ) ;

  } else {
    /*
     * Case 2: The liquid volume 'x' is less than half the total volume.
     * This implies the liquid itself forms a triangular prism.
     * Calculate the height 'h' of the liquid from the bottom.
     */
    var h = ( 2 * x ) / ( a * b ) ;

    // Calculate the angle 'c' (in radians) using arctangent for this case.
    // This angle represents the tilt of the liquid surface.
    var c = Math . atan ( b / h ) ;

    // Convert the angle 'c' from radians to degrees for the final result.
    var result = ( c * 180 ) / Math . PI ;

    // Output the final calculated angle to the console.
    console . log ( "%s" , result ) ;
  }
}

// Read input from standard input, parse it, and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . split ( "\n" ) ) ;