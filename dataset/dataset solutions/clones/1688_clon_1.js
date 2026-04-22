/*
 * This is a JavaScript function
 * that processes a numerical input.
 */
function   main(     arg    )    {

    /*
     * The following line was commented out in the original source.
     * It might have been used for multi-line string inputs.
     */
    // const input = arg.split( "\n" )

    // Initialize variable N by converting the argument to a number.
    let     N     =     Number(     arg     )     ;


    // Loop to reduce N to a value less than 1000.
    // This is equivalent to N = N % 1000 if N >= 1000.
    while     (     N     >=     1000     )     {

        N     %=     1000     ;     // Apply modulo operation.

    }


    // Print the final calculated value of N to the standard output.
    console     .     log     (     N     )     ;

    /*
     * Another commented-out line from the original snippet.
     * This could have been an alternative calculation or a debug statement.
     */
    // console.log( N === 1000 ? 0 : 1000 - N );


} // End of the main function definition.


/*
 * The following line shows an example of how the 'main' function
 * could be called with a hardcoded string value.
 * It's currently commented out, just as it was in the original.
 */
// main("1900")


// This is the primary execution point of the script.
// It reads content from standard input and passes it to the 'main' function.
main     (     require(     "fs"     )     .     readFileSync(     "/dev/stdin"     ,     "utf8"     )     )     ;