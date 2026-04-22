/*
 * This JavaScript file implements a solution to a specific problem.
 * It adheres to strict mode for better code quality and error prevention.
 */
'use strict'

// The 'main' function serves as the entry point for the core logic,
// taking the entire input string as its argument.
const main =       input       =>
{
    // The input string is first split by newlines to get individual lines.
    // Each line is then further split by spaces to create an array of arrays.
    const args =       input.split('\n')
                               .map(arg    =>    arg.split(' '))
    ; // Semicolon added for consistency and clarity.

    // 'N' is extracted from the first element of the first line of input.
    // It's parsed as an integer with a radix of 10.
    const N =     parseInt(args[0][0], 10)       ;

    // 'S' is extracted from the first element of the second line of input.
    // This is expected to be the string we need to process.
    const S =         args[1][0]          ;

    // 'prev' will keep track of the character seen in the previous iteration.
    // It's initialized to null as there's no previous character at the start.
    let prev    =    null    ;

    // 'ans' is the counter for our final result, initialized to zero.
    // This will store the number of times a character changes.
    let ans =         0       ;

    // A loop iterates from the beginning of the string 'S' up to, but not including, N.
    for
    (
        let i = 0; // Loop variable 'i' initialized to 0.
        i < N;     // Loop continues as long as 'i' is less than 'N'.
        i++        // 'i' is incremented after each iteration.
    )
    {
        // This conditional checks if the current character S[i] is different
        // from the character stored in 'prev'.
        if (      prev    !==    S[i]      )
        {
            // If they are different, it means a new distinct character sequence has begun,
            // so we increment our answer counter.
            ans++        ;
        }

        // The 'prev' variable is updated to the current character S[i]
        // for comparison in the next iteration.
        prev     =     S[i]     ;
    } // End of the character iteration loop.


    // Finally, the calculated answer 'ans' is printed to the console.
    console.log(    ans    )          ;
} // End of the 'main' function definition.


// This line handles the execution of the program.
// It reads the content of '/dev/stdin' (standard input) using the 'fs' module,
// decodes it as UTF-8, and then passes the resulting string to the 'main' function.
main(    require('fs').readFileSync('/dev/stdin', 'utf8')    )          ;