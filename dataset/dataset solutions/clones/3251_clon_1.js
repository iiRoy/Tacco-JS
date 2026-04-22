/*
 * This JavaScript file defines a function to perform a simple calculation.
 * It expects two space-separated integers as input from stdin.
 * The script then calculates half the product of these two integers.
 */

// Declares the primary function named 'main' which takes 'input' as its argument.
function   main   (   input   )
{
    // Splits the input string by spaces into an array of strings.
    const    args    =    input    .    split   (   ' '   )   ;

    // Parses the first element of the 'args' array into an integer, using base 10.
    const    a    =    parseInt   (   args   [   0   ]   ,   10   )   ;

    // Parses the second element of the 'args' array into an integer, using base 10.
    const    b    =    parseInt   (   args   [   1   ]   ,   10   )   ;

    // Calculates the product of 'a' and 'b', then divides the result by 2.
    // The final computed value is then output to the console.
    console   .   log   (   a   *   b   /   2   )   ;
}


// Invokes the 'main' function immediately.
// It reads the content of '/dev/stdin' as a UTF-8 encoded string.
// This is a common pattern for competitive programming environments in Node.js.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;

// End of script execution.