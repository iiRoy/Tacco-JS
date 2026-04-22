/*
 * This is a Type I clone of a JavaScript program.
 * It processes input data to find a minimum cost 'c'
 * given a time constraint 'T'.
 *
 * All identifiers, operators, and expressions remain identical.
 * Only whitespace and comments have been altered.
 */

'use strict'; // Enforce strict mode for better error handling and cleaner code.


const main = input =>
{
    // Destructure the first line of input to get 'n' (number of items)
    // and 'T' (the time constraint).
    const n = parseInt(input[0].split(' ')[0]), T = parseInt(input[0].split(' ')[1]);


    let ans = 10000; // Initialize 'ans' with a large sentinel value.
                     // This value also indicates "Time Limit Exceeded" (TLE) if not updated.

    // Loop through each item provided in the input, starting from the second line.
    for ( let i = 0 ; i < n ; i++ )
    {
        // Parse the cost 'c' and time 't' for the current item.
        let c = parseInt(input[i+1].split(' ')[0]), t = parseInt(input[i+1].split(' ')[1]);

        // Check if the current item's cost 'c' is less than the current minimum 'ans'
        // AND if its time 't' is within the allowed time constraint 'T'.
        if ( ( ans > c ) && ( T >= t ) )
        {
            ans = c; // If both conditions are met, update 'ans' with the new minimum cost.
        }
    }


    // Output the result.
    // If 'ans' is still the initial sentinel value, it means no item met the criteria,
    // so print 'TLE'. Otherwise, print the found minimum cost.
    console.log( ( ans == 10000 ) ? 'TLE' : ans );

}; // End of the main function definition.


// Read input from stdin, decode as UTF-8, split by newlines,
// and then pass the resulting array of strings to the 'main' function.
main( require("fs").readFileSync("/dev/stdin", "utf8").split('\n') );