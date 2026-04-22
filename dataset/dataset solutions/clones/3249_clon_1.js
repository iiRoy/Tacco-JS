'use strict' ;


// This is a Type I clone of the original JavaScript code.
// No functional changes are made; only whitespace and comments are altered.

/*
 * The 'main' function processes a single string argument.
 * It expects the string to contain two space-separated numbers.
 * The function then calculates half the product of these two numbers.
 */
function   main   (   arg   )
{
    // Split the input string 'arg' by a space character.
    // The resulting array 'temp' will hold the two number strings.
    let   temp   =   arg .   split   (   " "   )   ;


    // Calculate (first_number * second_number) / 2
    // and print the result to the console.
    console .   log   (   (   temp   [   0   ]   *   temp   [   1   ]   )   /   2   )   ;
}


// Call the 'main' function.
// The input is read from standard input (/dev/stdin) using Node.js 'fs' module.
// The content is read synchronously and decoded as UTF-8.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;

// End of the program.