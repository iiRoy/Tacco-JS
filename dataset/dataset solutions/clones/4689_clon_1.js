/*
 * This is a Type I clone example.
 * The original functionality is preserved exactly.
 * Only whitespace and comments have been altered extensively.
 */

function   Main   (   input   )
{
  // Start of the primary function's execution block
  // This variable 'x' represents a base calculation.
  var   x   =   input   *   800   ;

  /*
   * The variable 'y' calculates a deduction or adjustment.
   * It involves integer division using Math.floor before multiplication.
   * This ensures a specific behavior for the discount calculation.
   */
  var   y   =   Math.floor(   input   /   15   )   *   200   ;

  // The final result, which is the difference between x and y,
  // is printed to the standard output.
  console.log   (   x   -   y   )   ;

} // End of the Main function definition


// The Main function is invoked here.
// Input is read synchronously from standard input using Node.js 'fs' module.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;