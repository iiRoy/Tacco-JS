/*
 * This JavaScript program's primary function, 'Main',
 * processes the entire input data received, which is
 * passed as the 'input' parameter to the function.
 */
function   Main   (   input   )
{
    // The input string is first processed by splitting it
    // based on space characters. The resulting parts are
    // stored back into the 'input' variable, now as an array.
    // Consequently, the first segment of data will be in input[0],
    // the second in input[1], and so forth.
    input   =   input   .   split   (   " "   )   ;


    // For converting string representations of numbers into
    // their integer (base-10) equivalents, the 'parseInt' function
    // is utilized with a radix of 10.

    var   N   =   parseInt   (   input   [   0   ]   ,   10   )   ;   // 'N' holds the first numerical value.
    var   K   =   parseInt   (   input   [   1   ]   ,   10   )   ;   // 'K' holds the second numerical value.


    // The program's final output is determined by evaluating
    // a specific conditional expression involving 'N' and 'K'.

    if   (   N   %   K   ===   0   )   // Check if N is perfectly divisible by K (i.e., remainder is zero).
    {
        // If the condition holds true, print '0' to standard output.
        console   .   log   (   0   )   ;
    }
    else   // Otherwise, if N is not perfectly divisible by K.
    {
        // In this scenario, print '1' to standard output.
        console   .   log   (   1   )   ;
    }
}


/*
 * *****************************************************************************************
 * * Below this line, the code is responsible for standard input/output operations.       *
 * * It should not be altered or modified under any circumstances for proper functioning.  *
 * * The Main function is invoked with the content read from /dev/stdin.                 *
 * *****************************************************************************************
 */
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;