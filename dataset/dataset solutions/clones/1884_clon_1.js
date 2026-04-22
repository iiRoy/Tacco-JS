/*
 * This file contains a JavaScript program to solve a
 * combinatorial problem, likely involving modular arithmetic.
 * It reads input from standard input and prints the result.
 */

// Import the Node.js 'fs' module for file system operations.
const   input  =  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ;

/**
 * Calculates (x^n) % mod efficiently using binary exponentiation.
 * This is also known as exponentiation by squaring.
 *
 * @param {number} x The base.
 * @param {number} n The exponent.
 * @returns {number} The result of x^n modulo `mod`.
 */
function  pow ( x ,  n )
{
    // Initialize the result accumulator.
    let  res  =  1 ;

    // Loop while the exponent 'n' is greater than zero.
    while ( n  >  0 )
    {
        // If the least significant bit of 'n' is 1,
        // multiply 'res' by 'x'.
        if ( n  &  1 )
        {
            res  =  mul ( res ,  x ) ;
        }

        // Square the base 'x'.
        x  =  mul ( x ,  x ) ;

        // Right-shift 'n' by 1 bit, effectively dividing by 2.
        n  >>=  1 ;
    }

    // Return the final computed result.
    return  res ;
}


/**
 * Calculates the modular multiplicative inverse of 'x' modulo `mod`.
 * This uses Fermat's Little Theorem since `mod` is a prime number.
 * The inverse of x is x^(mod-2) % mod.
 *
 * @param {number} x The number for which to find the inverse.
 * @returns {number} The modular multiplicative inverse of 'x'.
 */
function  inv ( x )
{
    // Special case: if x is 1, its inverse is 1.
    if ( x  ==  1 )
    {
        return  1 ;
    }

    // Otherwise, compute x^(mod-2) using the pow function.
    return  pow ( x ,  mod  -  2 ) ;
}


/**
 * Performs modular multiplication of two numbers.
 * This custom multiplication function handles large numbers
 * to prevent overflow before taking the modulo, specifically
 * designed for NTT-friendly primes like 998244353.
 *
 * @param {number} a The first operand.
 * @param {number} b The second operand.
 * @returns {number} The product (a * b) % mod.
 */
function  mul ( a ,  b )
{
    // Implementation of modular multiplication that avoids intermediate overflow.
    // It splits 'a' into two parts (high 16 bits and low 16 bits).
    return  ( ( ( a  >>  16 )  *  b )  %  mod  *  65536  +  ( ( a  &  65535 )  *  b ) )  %  mod ;
}


// Define the modulo constant. This is a common prime used in competitive programming.
const  mod  =  998244353 ;

/*
 * This is an Immediately Invoked Function Expression (IIFE).
 * It encapsulates the main logic of the program.
 * The 'input' variable (from the file read operation) is passed as an argument.
 */
; ( ( input )  =>
{
    // Split the entire input string into an array of lines.
    const  lines  =  input . split ( '\n' ) ;

    // Parse the first line to get N, M, and K.
    // Assuming the first line contains three space-separated numbers.
    let  [ N ,  M ,  K ]  =  lines [ 0 ] . split ( ' ' ) . map ( Number ) ;

    // Initialize the answer variable.
    let  ans  =  0 ;

    // Initialize factorials or related terms.
    let  fa  =  1 ;
    let  fa2  =  1 ;

    // Loop from k = 0 up to K (inclusive).
    // This loop likely calculates terms for a sum, possibly related to combinations.
    for ( let  k  =  0 ;  k  <=  K ;  k ++ )
    {
        /*
         * Update 'fa' for the current iteration.
         * The (k || 1) ensures that if k is 0, it uses 1, otherwise k.
         * This might be part of a factorial calculation or a product term.
         */
        fa  =  mul ( fa ,  ( k  ||  1 ) ) ;

        /*
         * Update 'fa2' for the current iteration.
         * (k ? (N - k) : 1) means if k is non-zero, use (N-k), otherwise 1.
         * This also appears to be part of a product term, possibly related to (N-k)! or similar.
         */
        fa2  =  mul ( fa2 ,  ( k  ?  ( N  -  k )  :  1 ) ) ;

        // Calculate a 'left' term, which involves fa2 multiplied by the inverse of fa.
        // This often suggests a combination (nCk = n! / (k! * (n-k)!)) or permutation calculation.
        let  left  =  mul ( fa2 ,  inv ( fa ) )  %  mod ;

        /*
         * Add the current term to the total answer.
         * The term involves 'left', (M-1) raised to a power, and M.
         * This structure hints at a problem involving choosing items,
         * possibly with replacement or distinct choices.
         */
        ans  +=  mul ( left ,  pow ( ( M  -  1 ) ,  ( N  -  ( k  +  1 ) ) ) )  *  M  %  mod ;
    }

    // Print the final calculated answer modulo 'mod' to the console.
    console . log ( ans  %  mod ) ;

} ) ( input ) ; // Pass the 'input' variable to the IIFE.