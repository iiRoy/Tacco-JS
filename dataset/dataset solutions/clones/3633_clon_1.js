/*
 * This JavaScript file processes a numerical input.
 * The 'Main' function is responsible for reading and classifying the input.
 * It determines a category ("ABC", "ARC", or "AGC") based on the input value.
 */

// Define the primary function, named 'Main', which accepts an input string.
function   Main   (   input   )
{

    // Step 1: Prepare the input.
    // The raw input string is first trimmed to remove any leading or trailing whitespace.
    // After trimming, it is converted into an integer using parseInt().
    input   =   parseInt   (   input.trim( )   )   ;


    // Step 2: Evaluate the processed input against a series of conditions.

    // Check the first condition: Is the input value strictly less than 1200?
    if   (   input   <   1200   )
    {
        // If the input is less than 1200, output "ABC".
        console.log ( "ABC" ) ;
    }
    // If the first condition is not met, proceed to the next check.
    // This 'else if' block checks if the input is within a specific range:
    // greater than or equal to 1200 AND strictly less than 2800.
    else   if   (   input   >=   1200   &&   input   <   2800   )
    {
        // If the input falls into this range, output "ARC".
        console.log   (   "ARC"   )   ;
    }
    // If neither of the above conditions are true, this 'else' block is executed.
    // This implies the input value must be 2800 or greater.
    else
    {
        // For all other cases (input >= 2800), output "AGC".
        console.log   (   "AGC"   )   ;
    }

} // End of the 'Main' function definition.


// This line handles the execution of the program.
// It reads the content of '/dev/stdin' (standard input) as a UTF-8 string.
// The read content is then passed as the argument to the 'Main' function.
Main   (   require("fs").readFileSync("/dev/stdin",   "utf8")   )   ;

/* End of JavaScript program. */