/*
 * This JavaScript file processes input from standard input
 * to perform a simple calculation.
 *
 * It reads two numbers, N and A, and outputs N*N - A.
 * This is a demonstration of a Type I code clone.
 */

const   main   =   (   stdin   )   =>   {

    // Process the raw standard input string:
    // 1. Remove leading/trailing whitespace.
    // 2. Split the string into an array of lines.
    const   input   =   stdin   .   trim   (   )   .   split   (   '\n'   )   ;

    // Parse the first number from the input array.
    // This value will be assigned to variable N.
    const   N   =   parseInt   (   input   [   0   ]   )   ;

    // Parse the second number from the input array.
    // This value will be assigned to variable A.
    const   A   =   parseInt   (   input   [   1   ]   )   ;


    // Perform the calculation: N squared minus A.
    // The result is then printed to the standard output.
    console   .   log   (   N   *   N   -   A   )   ;

}   ;   // End of the main function definition


// This section handles reading data from standard input
// and then invokes the main function with the obtained data.
main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;