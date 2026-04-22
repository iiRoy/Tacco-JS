/*
 * This is a function that processes some input.
 * It determines if a specific condition is met based on two numbers.
 */
function   Main   (   input   )
{
    // Declare variable X and assign the first part of the input
    var   X   =   input   .   split   (   " "   )   [   0   ]   ;

    // Declare variable Y and assign the second part of the input
    var   Y   =   input   .   split   (   " "   )   [   1   ]   ;

    // Calculate a temporary value 'tmp' using X and Y
    var   tmp   =   2   *   X   -   Y   /   2   ;


    // Check the main condition: Y must be even and tmp must be non-negative
    if   (   Y   %   2   ===   0      &&      tmp   >=   0   )
    {
        // If the condition is true, print 'Yes'
        console   .   log   (   'Yes'   )   ;
    }
    else
    {
        // Otherwise, if the condition is false, print 'No'
        console   .   log   (   "No"   )   ;
    }
} // End of Main function definition


// Call the Main function with input read from standard input
// This assumes an environment where 'fs' module is available for file system operations.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;