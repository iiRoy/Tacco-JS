/*
 * This JavaScript file contains a function to determine
 * which of two values (A or B) is closer to a reference value (X).
 * It reads input from stdin and prints the result to stdout.
 */

// Define the main function that processes the input.
function   main(  input )
{
  // First, remove any leading or trailing whitespace from the input string.
  input = input.  trim();

  // Split the cleaned input string by spaces and convert each part to a number.
  // The input is expected to be three space-separated numbers: X, A, and B.
  const [  x, a, b  ] = input.split(  " "  ).map(  Number  );

  // --- Core logic to compare distances ---
  // Calculate the absolute difference between X and A.
  // Calculate the absolute difference between X and B.
  // If the distance from X to A is strictly less than the distance from X to B,
  // then A is closer to X.
  if (  Math.abs(  x  -  a  )  <  Math.abs(  x  -  b  )  )
  {
    // If A is closer, print "A" to the console.
    console.log(  "A"  );
  }
  else
  {
    // Otherwise (if B is closer or they are equidistant), print "B".
    console.log(  "B"  );
  }

} // End of the main function definition.


// This part of the script handles reading input and calling the main function.
// It reads the entire content of standard input synchronously, using UTF-8 encoding.
// Then, it passes the read content to the main function for processing.
main(  require("fs").readFileSync(  "/dev/stdin",  "utf8"  )  );