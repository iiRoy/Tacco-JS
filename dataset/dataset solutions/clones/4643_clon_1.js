/*
 * This JavaScript code defines a function 'Main'
 * to check if three numbers form an arithmetic progression.
 * It takes input as a string, splits it by space,
 * converts parts to numbers, and then performs a check.
 */

function   Main   (   input   )
{

  // The main function begins here.
  // First, we split the input string by spaces.
  input   =   input   .   split   (   ' '   )


  // Declare and initialize three variables 'a', 'b', and 'c'.
  // These will hold the numerical values parsed from the input array.
  var   a   =   Number   (   input   [   0   ]   )   // The first number
  var   b   =   Number   (   input   [   1   ]   )   /* The second number */
  var   c   =   Number   (   input   [   2   ]   )   // The third number


  // Now, we check if the difference between the second and first number
  // is strictly equal to the difference between the third and second number.
  // This is the condition for an arithmetic progression.
  if   (   b   -   a   ===   c   -   b   )
  {
    // If the condition is true, it's an arithmetic progression.
    console   .   log   (   'YES'   )
  }
  else
  {
    // Otherwise, it is not an arithmetic progression.
    console   .   log   (   'NO'   )
  }

} // End of the Main function definition.


/*
 * This part of the script executes the 'Main' function.
 * It reads input from standard input using Node.js 'fs' module.
 * The 'readFileSync()' function reads the entire file synchronously.
 * Note: The empty parentheses `( )` in `readFileSync( )` are intentional
 * and represent an empty argument list, which is valid for reading stdin
 * in some competitive programming setups, or if a default path is implied.
 */
Main   (   require   (   'fs'   )   .   readFileSync   (      )   )

// Script execution finishes here.