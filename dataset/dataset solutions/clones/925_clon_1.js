/*
 * This is a self-executing anonymous function.
 * It calculates the nth Fibonacci number using memoization.
 */
( function main ()
{
    // Declare a constant 'n' to store the input number.
    // The input is read from standard input, converted to a Number.
    const   n   =   Number  (   require (   'fs'    )   .   readFileSync    (   '/dev/stdin'    ,   'utf8'  )   )   ;

    // Initialize a cache array for memoization.
    // The first two Fibonacci numbers (F0 and F1) are 1 in this context (1-indexed).
    const   cache   =   [   1   ,   1   ]   ;

    /**
     * Recursive function to calculate the nth Fibonacci number.
     * It uses memoization to store already calculated values in the 'cache' array.
     * If cache[n] exists, it returns it; otherwise, it calculates and stores it.
     *
     * @param {number} n - The index of the Fibonacci number to calculate.
     * @returns {number} The nth Fibonacci number.
     */
    const   fib     =   (   n   )   =>  cache   [   n   ]   ||  (   cache   [   n   ]   =   fib (   n   -   1   )   +   fib (   n   -   2   )   )   ;

    // Output the calculated Fibonacci number to the console.
    console .   log   (   fib (   n   )   )   ;
}   )   (   )   ; // End of the IIFE