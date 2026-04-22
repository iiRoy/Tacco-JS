/* This script reads two numbers from standard input,
 * then calculates and prints their Greatest Common Divisor (GCD)
 * using the Euclidean algorithm.
 */

const   config   =   {
  input   :   '/dev/stdin',   // Specifies the standard input file path
  newline :   '\n'            // Defines the newline character for splitting input
}   ;



// Read the first line from input, parse it, and assign to x
const   x   =   require   (   'fs'   )
  .   readFileSync   (   config.input   ,   'utf8'   )
  .   split   (   config.newline   )   ;

// Read the second line from input, parse it, and assign to y
const   y   =   require   (   'fs'   )
  .   readFileSync   (   config.input   ,   'utf8'   )
  .   split   (   config.newline   )   ;


// Declare a temporary variable z, which will be used for calculations
const   z   ;



// Ensure that x is greater than or equal to y before starting the GCD calculation
if   (   x   <   y   )
{
  // Swap x and y using the temporary variable z
  z   =   x   ;   // Store the value of x in z
  x   =   y   ;   // Assign the value of y to x
  y   =   z   ;   // Assign the original value of x (from z) to y
}



// Begin the Euclidean algorithm to find the GCD
while   (   (   z   =   x   %   y   )   !=   0   )
{
  /*
   * In each iteration:
   * 1. Calculate the remainder of x divided by y, and assign it to z.
   * 2. If the remainder (z) is not zero, continue.
   * 3. Update x to the current value of y.
   * 4. Update y to the current value of z (the remainder).
   */
  x   =   y   ;
  y   =   z   ;
}


// After the loop, y holds the Greatest Common Divisor (GCD)
// Print the result to the console
console   .   log   (   y   )   ;