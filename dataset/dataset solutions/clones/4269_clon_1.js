/*
 * This script processes two numeric inputs from standard input.
 * It reads them, performs a specific calculation, and then prints
 * the result to the console. This is a utility function designed
 * for command-line execution or similar environments.
 */


// Declares the main function, which takes a single 'input' string parameter.
function   main   (   input   )
{

    // First step: Ensure the input string is clean by removing
    // any leading or trailing whitespace characters.
    input   =   input.trim   (   )   ;


    // Variable 'r' will store the first line of the input.
    // The input string is split by newline characters, and the
    // element at index 0 (the first line) is selected.
    var   r   =   input   .   split   (   "\n"   )   [   0   ]   ;


    // Variable 'g' will store the second line of the input.
    // Similarly, the input is split, and the element at index 1
    // (the second line) is assigned to 'g'.
    var   g   =   input   .   split   (   "\n"   )   [   1   ]   ;


    // The core calculation: multiply 'g' by 2, then subtract 'r'.
    // The result of this arithmetic operation is then
    // outputted to the standard console.
    console   .   log   (   g   *   2   -   r   )   ;

}


// This line initiates the execution of the 'main' function.
// It reads the entire content of '/dev/stdin' (standard input)
// as a UTF-8 encoded string using Node.js's built-in 'fs' module,
// and then passes that string as the 'input' argument to 'main'.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;

// End of JavaScript file.