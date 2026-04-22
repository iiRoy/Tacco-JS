// This script reads input from standard input,
// processes it, and then outputs results based on specific calculations.
const input = require("fs").readFileSync("/dev/stdin", "utf8") ;

/*
 * This is an Immediately Invoked Function Expression (IIFE).
 * It encapsulates the main logic of the program to prevent
 * variables from polluting the global scope.
 * The 'input' variable from the outer scope is passed as an argument.
 */
(       input       =>      {


    // Split the entire input string into an array of lines.
    const lines = input.split('\n') ;


    // The first line is expected to contain an integer N.
    // The '- 0' operation is a common JavaScript trick to convert a string to a number.
    const N = lines[0] - 0 ; // N represents the length of the binary string X.


    // The second line contains the binary string X.
    // .trim() removes any leading or trailing whitespace characters.
    const X = lines[1].trim() ;


    /*
     * Defines a helper function named 'popcount'.
     * This function calculates the population count (or Hamming weight)
     * of a given non-negative integer 'n'.
     * The population count is the number of '1' bits in its binary representation.
     */
    const popcount = n => {
        let count = 0 ; // Initialize a counter for set bits.

        // Loop continues as long as 'n' has bits to check.
        do {
            // Check if the least significant bit (LSB) of 'n' is 1.
            // If (n & 1) is true (1), increment 'count'. Otherwise, 'count' remains unchanged.
            n & 1 ? count++ : count ;
        } while ( n = n >>> 1 ) ; // Unsigned right shift 'n' by 1 bit, then assign back to 'n'.

        return count ; // Return the total number of '1' bits found.
    } ;


    /*
     * Defines another helper function named 'f'.
     * This function performs a sequence of operations involving the 'popcount' function.
     * It's a specific calculation related to repeated modulo operations.
     */
    const f = n => {
        // Base case: If the input 'n' is 0, the result is 0.
        if ( n === 0 ) {
            return 0 ;
        }

        let count = 1 ; // Initialize an iteration counter starting from 1.

        // Loop continues as long as the result of (n %= popcount(n)) is not zero.
        // This means 'n' is repeatedly updated by its modulo with its popcount.
        while ( n %= popcount(n) ) {
            count++ ; // Increment the counter for each iteration.
        }

        return count ; // Return the final count.
    } ;


    // Initialize a BigInt counter to store the number of '1's in the binary string X.
    let count = 0n ;

    // Iterate through each character (bit) of the binary string X.
    for ( let i = 0 ; i < N ; i++ ) {
        // If the character at the current index 'i' is '1', increment the BigInt counter.
        if ( X[i] === '1' ) count++ ;
    }

    // Calculate 'pr' (previous) and 'nx' (next) BigInt values.
    // These are derived from the total count of '1's in X.
    const pr = count - 1n ; // 'pr' is one less than the count of '1's.
    const nx = count + 1n ; // 'nx' is one more than the count of '1's.

    // Convert the binary string X into a BigInt.
    // parseInt(X, 2) converts the binary string to a regular number,
    // then BigInt() converts that number to a BigInt.
    const x = BigInt( parseInt( X, 2 ) ) ;

    // This is the main processing loop, iterating 'N' times, once for each bit position.
    for ( let i = 0 ; i < N ; i++ ) {
        // Calculate 'n' by XORing 'x' with a BigInt representing 2 raised to the power of (N - i - 1).
        // This effectively flips the i-th bit (from right to left, 0-indexed) of the BigInt 'x'.
        let n = x ^ BigInt( Math.pow( 2, N - i - 1 ) ) ;

        // If the resulting 'n' (after flipping a bit) is 0, print 0.
        if ( n === 0 ) {
            console.log( 0 ) ;
        } else {
            // Determine the divisor for the modulo operation.
            // If the original bit X[i] was '1', use 'pr'; otherwise, use 'nx'.
            const divisor = ( X[i] === '1' ? pr : nx ) ;

            // Calculate the modulo of 'n' by the chosen divisor.
            // The result is a BigInt, which is then converted to a Number.
            const mod = Number( n % divisor ) ;

            // Apply the function 'f' to the 'mod' result, add 1, and then print it to the console.
            console.log( f( mod ) + 1 ) ;
        }
    }

}       )(      input       ) ;
// End of the Immediately Invoked Function Expression.