'use strict' ; /* This directive enables strict mode, ensuring cleaner code. */


( function   ( input )   {

    // --- Input Processing Section ---

    /*
     * The raw input string is first processed:
     * 1. `trim()`: Removes leading/trailing whitespace.
     * 2. `split(/\s+/)`: Divides the string into an array of substrings
     *    using one or more whitespace characters as delimiters.
     * 3. `map(x => x - 0)`: Converts each string element in the array to a number.
     *    Subtracting zero is a common, concise way to achieve type conversion.
     */
    input = input
              .  trim  (  )
              .  split  (  / \s+ /  )
              .  map  (  x => x - 0  ) ;


    const N  =  input . shift ( ) ; // N represents the total number of children.
    const K  =  input . shift ( ) ; // K represents the total number of candies to be distributed.

    // M is a large prime number used for modulo arithmetic
    // to keep results within integer limits and handle large combinations.
    const M  =  Math . pow ( 10 , 9 )  +  7 ;

    const a  =  input ; // 'a' is an array where a[i] is the maximum candies child 'i' can receive.


    // --- Dynamic Programming (DP) Table Initialization ---

    /*
     * `dp` is a 2D array, serving as our dynamic programming table.
     * `dp[i][k]` will store the number of ways to distribute exactly 'k' candies
     * among the first `i+1` children (from index 0 up to `i`).
     * It's initialized with `N` rows and `K+1` columns, all set to zero.
     */
    const dp  =  new Array ( N )
                               . fill ( 0 )
                               . map ( x => new Array ( K + 1 ) . fill ( 0 ) ) ;

    /*
     * dp[i][k]で添字0~iの子供だけで考えた、飴玉0~k個を消費する場合の数の総和
     * (This original comment describes dp[i][k] as the sum of ways to distribute
     * 0 to k candies among children from index 0 to i.)
     */


    // --- Base Cases for DP ---

    /*
     * Conceptual base case for `dp[-1]`:
     * If there are no children (before the first child), there is 1 way
     * to distribute 0 candies (do nothing). For any other candy count, it's 0 ways.
     * This array will effectively store prefix sums for the "previous" child.
     */
    dp [ -1 ]  =  new Array ( K + 1 ) . fill ( 1 ) ;

    /*
     * Another conceptual base case: `dp[i][-1]`.
     * If we are considering a negative number of candies, there are 0 ways.
     * This helps in boundary conditions for `k-1` when `k` is 0.
     */
    for ( let i  =  -1 ;  i  <  N ;  i++ )
    {
        dp [ i ] [ -1 ]  =  0 ;
    }


    // --- Main DP Calculation Loop ---

    /*
     * The outer loop iterates through each child, from the first (index 0) to the last (N-1).
     * `i` represents the current child being considered.
     */
    for ( let i  =  0 ;  i  <  N ;  i++ ) {

        /*
         * The first inner loop calculates `dp[i][k]` for `k` up to `a[i]`.
         * This handles cases where the current child `i` can receive `k` candies.
         * The recurrence `dp[i][k] = (dp[i][k-1] + dp[i-1][k]) % M`
         * essentially calculates prefix sums.
         * `dp[i][k-1]` covers ways distributing `k-1` candies to child `i` and previous children.
         * `dp[i-1][k]` covers ways distributing `k` candies to previous children (child `i` gets 0).
         */
        for ( let k  =  0 ;  k  <=  a [ i ] ;  k++ )
        {
            dp [ i ] [ k ]  =  ( dp [ i ] [ k - 1 ]  +  dp [ i - 1 ] [ k ] )  %  M ;
        }

        /*
         * The second inner loop handles `k` values greater than `a[i]`.
         * In these cases, child `i` cannot receive `k` candies.
         * The recurrence `dp[i][k] = (dp[i][k-1] + dp[i-1][k] - dp[i-1][k-a[i]-1] + M) % M`
         * subtracts the invalid distributions where child `i` would have received
         * more than `a[i]` candies.
         * `+ M` is added before the final modulo to ensure the result is positive,
         * as JavaScript's `%` operator can return negative values for negative operands.
         */
        for ( let k  =  a [ i ]  +  1 ;  k  <=  K ;  k++ )
        {
            dp [ i ] [ k ]  =  ( dp [ i ] [ k - 1 ]  +  dp [ i - 1 ] [ k ]  -  dp [ i - 1 ] [ k - a [ i ] - 1 ]  +  M )  %  M ;
        }
    }


    /*
     * For debugging purposes, one might uncomment the following line
     * to inspect the fully populated DP table.
     * // console . log ( dp ) ;
     */


    // --- Final Answer Calculation ---

    /*
     * The problem asks for the number of ways to distribute *exactly* K candies.
     * `dp[N-1][K]` gives the sum of ways to distribute 0 to K candies among N children.
     * `dp[N-1][K-1]` gives the sum of ways to distribute 0 to K-1 candies among N children.
     * Subtracting these two values yields the number of ways to distribute exactly K candies.
     * Again, `+ M` is used to handle potential negative results from subtraction before modulo.
     */
    const ans  =  ( dp [ N - 1 ] [ K ]  -  dp [ N - 1 ] [ K - 1 ]  +  M )  %  M ;

    // Output the final calculated answer to the console (standard output).
    console . log ( ans ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; /* The entire script is wrapped in an Immediately Invoked Function Expression (IIFE).
                                                                       * It reads input from standard input (`/dev/stdin`) using Node.js's `fs` module.
                                                                       * The input is read as a UTF-8 encoded string. */