/*
 * This is the main entry point function for the program.
 * It takes 'input' as a string argument.
 */
function Main(  input  ) {
  // Enforce strict mode for better error handling and cleaner code.
  "use strict"  ;

  // Split the entire input string by newline characters.
  // This creates an array where each element is a line from the input.
  const   temp   =   input . split (  "\n"  )   ;


  // The first line of input (after splitting) represents 'n'.
  // We parse it as an integer and remove it from the 'temp' array.
  const   n   =   parseInt (  temp . shift ( )  )   ;

  // The second line of input contains space-separated position values.
  // We split it by spaces, then map each string to an integer.
  // This also removes the line from the 'temp' array.
  const   positions   =   temp . shift ( ) . split (  " "  ) . map (  x   =>   parseInt (  x  )  )   ;


  // Initialize 'minVariance' to a very large number (positive infinity).
  // This variable will store the minimum variance found.
  let   minVariance   =   Infinity   ;

  // Iterate through possible integer values for 'i' from 1 to 100 (inclusive).
  // These values represent potential target positions for calculating variance.
  for (  let   i   =   1  ;   i   <= 100  ;   i ++  ) {

    // For each 'i', calculate the variance.
    // The variance is the sum of squared differences between each position 'x' and 'i'.
    const   variance   =   positions . map (  x   =>   (  x   -   i  )   * (  x   -   i  )  ) . reduce (  (  a  ,   b  )   =>   a   +   b  )   ;

    // Update 'minVariance' if the current 'variance' is smaller.
    minVariance   =   Math . min (  minVariance  ,   variance  )   ;
  }

  // Finally, print the calculated minimum variance to the console.
  console . log (  minVariance  )   ;
}

// * This section handles standard input/output and calls the Main function.
// * Please do not modify the code below this line, as it is part of the judge system.
// * It reads the entire input from /dev/stdin and passes it to Main.
Main (  require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,   "utf8"  )  )   ;