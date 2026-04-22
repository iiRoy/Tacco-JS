/*
 * This is a JavaScript function designed to process input
 * and determine a condition based on square roots of three numbers.
 *
 */
function Main(  input  ) {

  // The original input string is expected to contain space-separated values.
  // We first split the input string into an array of strings.
  input = input . split ( " " );

  // Now, we parse the string elements into numbers.
  // The first element becomes 'a'.
  const a =  Number( input [ 0 ] ) ;
  // The second element becomes 'b'.
  const b =  Number( input [ 1 ] ) ;
  // And the third element becomes 'c'.
  const c =  Number( input [ 2 ] ) ;

  // --- Core Logic Starts Here ---

  // We are checking a specific mathematical inequality.
  // Is the square root of 'c' strictly greater than the sum of
  // the square roots of 'a' and 'b'?
  if (  Math.sqrt ( c )  >  Math.sqrt ( a )  +  Math.sqrt ( b )  )
  {
    // If the condition holds true, print "Yes".
    console.log( "Yes" ) ;
  }
  // Otherwise, if the square root of 'c' is less than or equal to
  // the sum of the square roots of 'a' and 'b', then print "No".
  // Note: This 'else if' covers all remaining cases, effectively making it an 'else'.
  else if (  Math.sqrt ( c )  <=  Math.sqrt ( a )  +  Math.sqrt ( b )  )
  {
    console.log(  "No"  ) ;
  }

  // --- End of Core Logic ---

} // End of Main function definition

// This section handles the execution of the Main function
// by reading input from standard input (/dev/stdin).
// DO NOT MODIFY THE FOLLOWING LINE(S) AS PER ORIGINAL INSTRUCTION.
// It ensures compatibility with the judging system.
Main( require("fs").readFileSync("/dev/stdin", "utf8") );