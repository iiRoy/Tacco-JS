/*
 * This JavaScript module defines a primary function, 'main',
 * which is responsible for processing a given input string.
 * The script is structured to be executed in a Node.js environment,
 * reading its input from standard input.
 */
function   main   (   input   )   {

    // Initialize a constant array 'a' by trimming the input string
    // and then splitting it into individual characters.
    const   a   =   input . trim ( ) . split ( '' )   ;

    // Declare and initialize a mutable variable 'count' to zero.
    // This variable will accumulate scores based on character checks.
    let   count   =   0   ;


    /*
     * A standard 'for' loop is used here to iterate through the first
     * three elements of the 'a' array (indices 0, 1, and 2).
     * This loop structure is fixed for a specific number of iterations.
     */
    for   (   let   i   =   0   ;   i   <   3   ;   i ++   )   {
        // Inside the loop, an 'if' condition checks if the character
        // at the current index 'i' in array 'a' is exactly 'o'.
        if   (   a [ i ]   ==   'o'   )   {
            // If the condition is true (the character is 'o'),
            // 100 points are added to the 'count' variable.
            count   +=   100   ;
        }
    }

    // The following line was commented out in the original code
    // and has been removed in this clone for visual distinction.
    // //let cnt = parseInt(count, 10);

    // Finally, the script outputs the result to the console.
    // It calculates a final score by adding a base value of 700
    // to the accumulated 'count'.
    console . log   (   700   +   count   )   ;
}

// This section is responsible for invoking the 'main' function.
// It reads the entire content of '/dev/stdin' synchronously using
// Node.js's 'fs' module, interpreting it as UTF-8 encoded text,
// and passes this content as the 'input' argument to 'main'.
main   (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   )   ;

// End of the JavaScript program.