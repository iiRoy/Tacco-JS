"use strict" ; /* This directive enables strict mode, which helps catch common coding errors and "unsafe" actions. */


// The main entry point function that processes the input argument.
const   main  =  arg  =>   {

        // First, remove any leading or trailing whitespace from the input string.
        // Then, split the string into an array of lines based on the newline character.
        arg   =   arg . trim ( ) . split ( "\n" ) ;

    /*
     * Extract numerical values for N and M from the first line of the processed input.
     * The first line is expected to contain two space-separated integers.
     * 'parseInt' converts the string representation of numbers into actual integer types.
     */
    const   N   =   parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ; // N represents the first number.
    const   M   =   parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] ) ; // M represents the second number.


    // This conditional block checks a fundamental constraint for the problem.
    // If the absolute difference between N and M is greater than 1, it's impossible to arrange
    // N items and M items alternately (e.g., N, M, N, M...) without having two of the same
    // type next to each other. In such cases, the count of valid arrangements is 0.
    if  (  Math . abs ( N   -   M )   >   1  )   {
                                              console . log ( 0 ) ; // Output 0 to standard output.
                                              return ; // Terminate the function's execution immediately.
    }


    /*
     * Define a constant for the modulo operation.
     * This value (10^9 + 7) is a common large prime number used in competitive programming
     * to prevent integer overflow when dealing with large products, ensuring results
     * remain within a manageable range.
     */
    const   MOD   =   1e9   +   7 ;

    // Initialize the 'answer' variable, which will accumulate the product of factorials.
    let   answer   =   1 ;


    // This loop calculates N factorial (N!) modulo MOD.
    // It iterates from 1 up to N, multiplying the current 'answer' by 'i' at each step.
    // The modulo operation is applied at each multiplication to keep the intermediate results
    // within the bounds defined by MOD, preventing overflow.
    for  (  let   i = 1 ;   i <= N ;   i ++  )   {
        answer   =   ( answer   %   MOD )   *   ( i   %   MOD ) ;
    }


    // This loop calculates M factorial (M!) modulo MOD.
    // Similar to the previous loop, it iterates from 1 up to M, multiplying 'answer' by 'i'.
    // The modulo operation is crucial here as well for maintaining result integrity.
    for  (  let   i = 1 ;   i <= M ;   i ++  )   {
        answer   =   ( answer   %   MOD )   *   ( i   %   MOD ) ;
    }

    /*
     * Finally, calculate and output the total number of arrangements.
     * The multiplier depends on whether N and M are equal:
     * - If N == M (e.g., NNNMMM), the difference is 0. There are 2 ways to start the alternating sequence (e.g., NMNMNM or MNMNMN).
     *   The expression (N == M) evaluates to 'true' (which is 1 in numeric context) if they are equal.
     *   So, (1 + 1) = 2.
     * - If |N - M| == 1 (e.g., NNNMM), there's only 1 way to start the sequence (e.g., NMNMN).
     *   The expression (N == M) evaluates to 'false' (which is 0 in numeric context) if they are not equal.
     *   So, (0 + 1) = 1.
     * The final product is then taken modulo MOD to ensure the result is within the specified range.
     */
    console . log ( answer   *   ( ( N   ==   M )   +   1 )   %   MOD ) ;

}
// The script execution starts here. It reads the entire content of '/dev/stdin' as a UTF-8 string,
// and then passes this content as the 'arg' parameter to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;