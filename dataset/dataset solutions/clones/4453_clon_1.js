/*
 * This JavaScript file contains a simple program.
 * It reads input, processes it, and prints a result.
 */


// Define the primary function of the application.
function   main   (   input   )
{
    // This variable will hold the first element from the input array.
    var   a   =   input   [   0   ]   ;

    // Output the concatenated string to the standard console.
    console   .   log   (   "ABC"   +   a   )   ;
}


// Invoke the main function immediately after its definition.
// The input is derived from reading the standard input stream.
main   (
        require   (   'fs'   )   .
        readFileSync   (
                '/dev/stdin'   ,
                'utf8'
            )   .
        trim   (   )   .
        split   (
                "\n"
            )
)   ; // End of program execution.