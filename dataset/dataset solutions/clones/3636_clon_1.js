/*
 * This function serves as the primary entry point for processing input.
 * The 'input' parameter is expected to contain string data
 * that will be parsed and evaluated.
 */
function   Main   (   input   )
{
    // Declare a variable 'r' to hold the integer value parsed from the input string.
    var   r   =   parseInt   (   input   ,   10   )   ;

    // Initialize the 'result' variable with a default classification string.
    var   result   =   'AGC'   ;


    // Begin conditional logic to classify 'r' and update the 'result'.
    if     (     r     <     1200     )
    {
        // If 'r' is below the first threshold, assign 'ABC' to result.
        result   =   'ABC'   ;
    }
    else   if   (   r   <   2800   )
    {
        // If 'r' is below the second threshold (but not the first), assign 'ARC'.
        result   =   'ARC'
    }
    // End of conditional classification.


    // Output the final determined classification to the standard console.
    console.log   (   result   )   ;
}


// --- Main Program Execution Start ---
// This line handles reading input from stdin and passes it to the Main function.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;