/*
 * This JavaScript file contains the implementation of the Main function.
 * It processes a numerical input and prints different strings based on its value.
 * This is an example of conditional logic in programming.
 */

function    Main  (  input  )
{
    // First conditional check: Is the input value strictly less than 1200?
    // If this condition holds true, the program will print "ABC".
    if  (  input  <  1200  )
    {
        console.log  (  'ABC'  )  ; // Output for the first range.
    }


    // Second conditional check: Is the input value within the range [1200, 2800)?
    // This means input is greater than or equal to 1200 AND less than 2800.
    if  (  input   >=   1200   &&   input   <   2800  )
    {
        console.log  (  'ARC'  )  ; // Output for the second range.
    }


    // Third conditional check: Is the input value less than or equal to 4208?
    // Note that this condition can overlap with the previous ones.
    if  (  input   <=   4208  )
    {
        console.log  (  'AGC'  )  ; // Output for the third range.
    }

} // End of the Main function definition.


// This section handles the execution of the Main function.
// It reads input from standard input using Node.js 'fs' module.
// The 'utf8' encoding is specified for the input stream.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;