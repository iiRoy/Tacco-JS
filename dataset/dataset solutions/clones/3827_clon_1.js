/*
 * This JavaScript file contains a function to calculate the maximum
 * perfect power less than or equal to a given input 'x'.
 * It reads input from standard input, processes it, and then
 * prints the result to the console.
 *
 * Author: AI Code Generator
 * Date: 2023-10-27
 */

function   main ( input )
{
    // Parse the input string into an integer 'x'.
    // First, remove any leading/trailing whitespace, then convert to base 10.
    const   x   =   parseInt ( input.trim ( ) ,   10 ) ;

    // Initialize a Set to store perfect powers.
    // Start with 1, as 1 is a perfect power (1^n or n^0).
    let   b   =   new   Set ( [ 1 ] ) ;

    // Outer loop: iterate through possible exponents 'j' from 2 to 10.
    // We consider 'j' as the power to which a base 'i' is raised.
    for   ( let   j   =   2 ;   j   <=   10 ;   j++   )
    {
        // Inner loop: iterate through possible bases 'i' starting from 2.
        // Calculate i^j and add it to the Set 'b' as long as it does not exceed 'x'.
        for   ( let   i   =   2 ;   i   **   j   <=   x ;   i++   )
        {
            // Add the calculated perfect power i^j to our set.
            // Using a Set automatically handles duplicate values.
            b.add ( i   **   j ) ;
        }
    }

    // After populating the set 'b' with all relevant perfect powers,
    // find and print the maximum value within the set.
    // The spread operator (...) expands the Set into individual arguments for Math.max().
    console.log ( Math.max ( ...b ) ) ;
}

// Call the main function with input read from standard input.
// 'fs.readFileSync' reads the file synchronously.
// '/dev/stdin' is the conventional path for standard input in Unix-like systems.
// 'utf8' specifies the encoding for the input.
main ( require ( 'fs' ) .readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;