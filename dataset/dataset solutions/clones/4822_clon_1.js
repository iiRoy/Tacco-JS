/*
 * This is the primary function of the script.
 * It takes input as a single string and processes it.
 *
 * @param {string} input - The raw input string, typically from stdin.
 */
function     main   (   input   )
{
    // First, we split the input string into an array of lines.
    // Each element in 'args' will correspond to a line from the input.
    const   args    =   input   .   split   (   '\n'    )   ;

    /*
     * The first line of input (args[0]) contains two space-separated values:
     * H (height) and W (width). We destructure them here.
     * W is not used in this particular implementation, but it's parsed.
     */
    const   [   H   ,   W   ]   =   args    [   0   ]   .   split   (   ' '   )   ;


    // Initialize an array named iArray. Its size is determined by H.
    // This array will store the subsequent lines of input.
    let     iArray      =       new     Array   (   H   )   ;

    /*
     * This loop iterates from i = 0 up to, but not including, H.
     * It populates iArray with lines from the 'args' array,
     * starting from the second line of the original input (args[1]).
     */
    for     (   let     i   =   0   ;   i   <   H   ;   i   ++   )
    {
        // Assign the (i+1)-th line from 'args' to the i-th position of 'iArray'.
        // This skips the first line which contained H and W.
        iArray  [   i   ]       =       args    [   i   +   1   ]   ;
    }


    /*
     * This is the second main loop.
     * It also iterates from i = 0 to H-1.
     * Inside this loop, each element of iArray is printed to the console twice.
     */
    for     (   let     i   =   0   ;   i   <   H   ;   i   ++   )
    {
        // First output of the current array element.
        console .   log     (   iArray   [   i   ]   )   ;
        // Second output of the exact same array element, creating a duplicate print.
        console .   log     (   iArray   [   i   ]   )   ;
    }
}
// End of the 'main' function definition.


/*
 * This is the entry point for executing the script.
 * It reads the entire content of standard input ('/dev/stdin')
 * as a UTF-8 encoded string and passes it to the 'main' function.
 * The 'require('fs')' call loads the Node.js file system module.
 */
main    (       require (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )       )   ;
// Script execution completes after the main function finishes.