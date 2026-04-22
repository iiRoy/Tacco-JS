/*
 * This JavaScript file contains a single function, 'Main',
 * which processes an input string to perform a simple calculation.
 * The input is expected to be two space-separated numbers.
 */

function    Main   (   input   )
{

  // The input string is split by space, and each part is converted to a number.
  const   numbers   =   input   .   split (   ' '   )   .   map (   n   =>   Number (   n   )   )   ;


  // The first number from the input array is assigned to 'x'.
  const   x   =   numbers   [   0   ]   ;

  // The second number from the input array is assigned to 't'.
  const   t   =   numbers   [   1   ]   ;


  /*
   * Now, we determine the output based on a simple comparison:
   * If 'x' is less than or equal to 't', the result is 0.
   * Otherwise, the result is the difference between 'x' and 't'.
   */
  if   (   x   <=   t   )
  {
        console   .   log   (   '0'   )   ;   // Output '0' if x is less than or equal to t.
  }
  else
  {
        console   .   log   (   x   -   t   )   ;   // Output the positive difference.
  }

}   // End of the Main function definition.



// This part of the script handles reading input from standard input
// and then invoking the 'Main' function with that input.
// It's a common setup for competitive programming environments.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;