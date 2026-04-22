/* This is a simple JavaScript program. */
/*
 * The purpose of this code is to check for the presence of
 * specific numbers in the input string.
 *
 * It looks for "1", "7", "4", and "9".
 */
function     Main   (   input   )
{
    // First, process the input string.
    // It's expected to be a space-separated sequence of numbers.
    input     =     input   .   split   (   " "   )   ;

    // Initialize boolean flags for each number we are looking for.
    // All flags are set to 'false' initially.
    one     =     false   ; // Flag for the number 1
    nana    =     false   ; // Flag for the number 7
    nine    =     false   ; // Flag for the number 9
    four    =     false   ; // Flag for the number 4

    /*
     * Iterate through the first four elements of the input array.
     * The problem implies we only need to check the first four values.
     */
    for     (   i   =   0   ;   i   <   4   ;   i ++   )
    {
        // Check if the current element is "1".
        if   (   input   [   i   ]   ===   "1"   )
            one   =   true   ;

        // Check if the current element is "7".
        if   (   input   [   i   ]   ==   "7"   )
            nana  =   true   ;

        // Check if the current element is "4".
        if   (   input   [   i   ]   ==   "4"   )
            four  =   true   ;

        // Check if the current element is "9".
        if   (   input   [   i   ]   ==   "9"   )
            nine  =   true   ;
    }

    // After the loop, check if all required numbers were found.
    if   (   one   &&   nana   &&   nine   &&   four   )
    {
        // If all flags are true, print "YES" to the console.
        console   .   log   (   'YES'   )   ;
    }
    // If not all conditions are met, nothing is explicitly printed here,
    // implying a default behavior or no output for the 'NO' case.
}


// This part of the script handles reading the input from standard input.
// It uses Node.js specific functions to read the file content.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;
/* End of the program. */