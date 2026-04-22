/*
 * This is a Type I clone of the original JavaScript code.
 * It performs a base-26 conversion from a BigInt input to a string,
 * treating 'z' as the 0th character in a 1-indexed system for 'a' through 'y'.
 *
 * All identifiers, operators, and expressions are strictly preserved.
 * Only whitespace and comments have been altered extensively.
 */

/**
 * The main function that processes the input and prints the result.
 * @param {string} input - The raw input string containing the number.
 */
const main = ( input ) =>
{

    // Initialize 'n' by converting the trimmed input to a BigInt.
    let n = BigInt( input.trim() );

    // Define the alphabet string for conversion. 'z' is at index 0.
    const alpha = 'zabcdefghijklmnopqrstuvwxyz';

    // Initialize an array to store the characters of the result.
    let ans = [ ];


    // Loop until the number 'n' becomes zero.
    while ( n !== 0n )
    {

        // Calculate the next value for 'n'. If 'n' is exactly 26n, the next value is 0n.
        // Otherwise, it's integer division by 26n.
        const next = n === 26n
            ? 0n
            : n / 26n;

        // Calculate the remainder when 'n' is divided by 26n.
        const r = n % 26n;

        // Prepend the character corresponding to the remainder to the 'ans' array.
        ans.unshift( alpha[ `${r}` ] );

        // Update 'n' for the next iteration.
        n = next;

    } // End of while loop.


    // Join the characters in the 'ans' array and print the final string to the console.
    return console.log( ans.join( '' ) );

}; // End of main function.


/*
 * This section handles the execution environment.
 * It checks for a 'MYTEST' environment variable to determine execution path.
 */
process
    .env
    .MYTEST
    // If MYTEST is defined:
    ? (
        process.env.MYTEST === 'test'
            // If MYTEST is 'test', call the test() function (assumed to be defined elsewhere).
            ? test()
            // Otherwise, read from 'dev/stdin' and pass to main.
            : main(
                require( 'fs' )
                    .readFileSync( 'dev/stdin', 'utf8' )
            )
    )
    // If MYTEST is not defined, read from '/dev/stdin' and pass to main.
    : main(
        require( 'fs' )
            .readFileSync( '/dev/stdin', 'utf8' )
    ); // End of conditional execution.