/* This is a Type I clone of an original JavaScript program.
 * It strictly adheres to the definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * No identifier, keyword, operator, or literal value has been altered.
 * Only spacing, indentation, and comments have been modified extensively.
 */

( function main ( )
{
    // Define a constant 'n' by reading input from standard input.
    // The input is expected to be a number, which is then parsed.
    const n = Number ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;


    /*
     * Initialize a cache array with the first few Fibonacci numbers.
     * This serves as a memoization table to significantly speed up
     * subsequent calculations for these initial values.
     */
    const cache = [ 1 , 1 , 2 , 3 , 5 , 8 , 13 , 21 , 34 , 55 , 89 , 144 ] ;

    // Define the Fibonacci function using a function expression.
    // This function recursively calculates Fibonacci numbers,
    // leveraging the 'cache' for memoization to avoid redundant computations.
    const fib = function fib ( n )
    {
        /*
         * Check if the Fibonacci number for the given 'n' is already in the cache.
         * If 'cache[n]' is truthy (i.e., the value exists and is not 0 or null),
         * return it directly.
         * Otherwise, calculate it recursively as fib(n-1) + fib(n-2),
         * store the result in 'cache[n]', and then return the stored value.
         */
        return cache [ n ] || ( cache [ n ] = fib ( n - 1 ) + fib ( n - 2 ) ) ;
    } ;

    // Output the final result of the Fibonacci calculation for 'n' to the console.
    console . log ( fib ( n ) ) ;

} ) ( ) ; // This is an Immediately Invoked Function Expression (IIFE) to encapsulate the code.