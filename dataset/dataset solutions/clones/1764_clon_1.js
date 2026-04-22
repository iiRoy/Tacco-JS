/*
 * This module is designed to perform a specific recursive calculation,
 * incorporating memoization for efficiency. It processes input from
 * standard input to determine the parameters for the calculation.
 */

 const   keyStr   =  ( r ,  c )  =>   `r${ r }c${ c }` ; //  A small utility to create a unique string key from two numbers.


 const   calcMap  =  new  Map ( ) ; //  This Map serves as a cache for memoization, storing previously computed results.


/**
 *  The core recursive function that calculates a value based on four BigInt parameters.
 *  It uses memoization to avoid redundant computations, significantly improving performance
 *  for overlapping subproblems. The modulo operation is applied at each step.
 *
 *  @param {BigInt} a  The first BigInt parameter.
 *  @param {BigInt} b  The second BigInt parameter.
 *  @param {BigInt} c  The third BigInt parameter, which often decrements in recursive calls.
 *  @param {BigInt} d  The fourth BigInt parameter, also often decrements.
 *  @returns {BigInt}  The computed result, modulo 998244353n.
 */
const   calc   =  ( a ,  b ,  c ,  d )  =>
{
        //  Construct a unique key for the current state (c, d) to check the cache.
        const   key   =   keyStr ( c ,  d ) ;

        //  Check if the result for these parameters is already in the memoization map.
        if  ( calcMap . has ( key ) )
        {
                //  If found, return the cached value immediately.
                return   calcMap . get ( key ) ;
        }

        let   ans ; //  Declare a variable to store the answer for the current call.

        //  First base case: if 'a' is equal to 'c'.
        if  ( a   ===   c )
        {
                ans   =   ( a   **   ( d   -   b ) )   %   998244353n ;
        }
        //  Second base case: if 'b' is equal to 'd'.
        else   if  ( b   ===   d )
        {
                ans   =   ( b   **   ( c   -   a ) )   %   998244353n ;
        }
        //  Recursive step: general case when neither base condition is met.
        else
        {
                //  The calculation involves three recursive calls, combining their results.
                //  Each term is multiplied by a parameter and then combined.
                ans   =   (
                                calc ( a ,  b ,  c   -   1n ,  d )   *   d   +
                                calc ( a ,  b ,  c ,  d   -   1n )   *   c   -
                                calc ( a ,  b ,  c   -   1n ,  d   -   1n )   *   ( c   -   1n )   *   ( d   -   1n )
                          )   %   998244353n ; //  Apply modulo to the final sum.
        }

        //  Store the newly computed answer in the cache before returning.
        calcMap . set ( keyStr ( c ,  d ) ,  ans ) ;

        return   ans ; //  Return the calculated answer.
}

/**
 *  The main entry point of the program. It reads input, parses it,
 *  calls the calculation function, and prints the final result.
 *
 *  @param {string} input  The raw string input, expected from standard input.
 */
const   main   =  ( input )  =>
{
        //  Split the input string by newline characters.
        const   inputs   =   input . split ( "\n" ) ;

        //  Parse the first line of input to extract four BigInt parameters (a, b, c, d).
        const   [ a ,  b ,  c ,  d ]   =   inputs [ 0 ] . split ( " " ) . map ( num   =>   BigInt ( num ) ) ;

        //  Perform the calculation and convert the BigInt result to a Number for logging.
        console . log ( Number ( calc ( a ,  b ,  c ,  d ) ) ) ;
}

//  Immediately invoke the main function, reading input from /dev/stdin.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;