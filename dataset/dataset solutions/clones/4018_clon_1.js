/*
 * This file contains a JavaScript function to solve a specific problem.
 * It calculates a value 'ans' based on the input string 'N'.
 * The problem seems to involve digit manipulation or number properties.
 *
 * Author: AI Code Clone Generator
 * Date: 2023-10-27
 */

// Define the main function that processes the input string N.
function   Main (  N  )    {
    // Declare local variables used within this function.
    var   l   =   N.length ;  // 'l' stores the length of the input string N.

    var   lt   =   parseInt (  N.substr (  0 ,  1  )  ) ;  // 'lt' gets the first digit of N as an integer.

    var   rt   =   N.substr (  -1  ) ;  // 'rt' gets the last character (digit) of N as a string.

    var   ans  ;   // 'ans' will store the final computed answer.


    // Begin conditional logic to determine the value of 'ans'.
    if  (  l   ===   1  )  {
        // If the input string N has only one digit.
        ans   =   parseInt (  N  ) ;
    }
    // Else if the last digit is '9' and there are multiple '9's.
    else   if  (  rt.match (  /9/g  )  )
    {
        // Check if all digits except the first are '9'.
        if  (  rt.match (  /9/g  )  .length   ===   l   -   1  )
        {
            // Calculate 'ans' based on the special condition.
            ans   =   (  l   -   1  )   *   9   +   lt ;
        }
        // If the inner condition is not met, the outer 'else' will handle it.
    }
    // Default case: for all other scenarios not covered by the above 'if' and 'else if'.
    else
    {
        // Calculate 'ans' for the general case.
        ans   =   (  l   -   1  )   *   9   +   lt   -   1 ;
    }


    // Output the calculated answer to the console.
    console.log (  ans  ) ;
}

// Call the Main function with input read from standard input.
// This line reads the entire content of /dev/stdin as a UTF-8 string.
Main (  require (  "fs"  )  .readFileSync (  "/dev/stdin" ,  "utf8"  )  ) ;

// End of file.