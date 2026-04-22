/*
 * This is a Type I clone example.
 * The original logic and identifiers are preserved.
 */
function   Main   (   input   )
{
    // The input string is processed here.
    input   =   input .   split   ( "\n" )   .   map   (   v   =>   v .   split   (   " "   )   )   ;


    // Extracting the value of 'n' from the processed input.
    const   n   =   input   [   0   ]   [   0   ]   ;


    /*
     * Loop indefinitely until a specific condition is met.
     * The loop variable 'i' starts from 1 and increments in each iteration.
     */
    for   (   let   i   =   1   ;   true   ;   i ++   )
    {
        // This comment explains the mathematical relationship being tested.
        // It's equivalent to: (i * (i + 1) / 2) % n === 0
        if   (   (   (   i   *   (   i   +   1   )   /   2   )   %   n   )   ===   0   )
        {
            // If the condition is true, print 'i' to the console.
            console   .   log   (   i   )   ;

            // And then exit the loop immediately.
            break   ;
        }
    }
} /* End of Main function */


// Initiating the program by calling the Main function.
// It reads input from standard input.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// A final comment at the end of the file.