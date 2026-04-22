/* This JavaScript file contains an implementation of the 0/1 Knapsack problem.
 * It reads input from standard input, processes it, and then calculates
 * the maximum possible value of items that can be placed into a knapsack
 * without exceeding its weight capacity.
 */

// Define the main function to handle input and orchestrate the solution.
function Main(  input  )   {

    /* The input string is expected to contain multiple lines.
     * We split it by newline characters to get an array of strings,
     * where each string represents a line of input data.
     */
    input  =  input . split ( "\n" ) ;


    // A utility arrow function to convert a string to an integer.
    // It uses parseInt with a radix of 10 to ensure decimal parsing.
    const changeInt  =  ( n )  =>  {
        return  parseInt ( n ,  10 ) ;
    } ;


    // The first line of input contains two space-separated integers:
    // N: the number of items available.
    // W: the maximum weight capacity of the knapsack.
    const  [ N , W ]  =  input [ 0 ] . split ( ' ' ) . map ( changeInt ) ;


    // Initialize an empty array to store the weight and value pairs for each item.
    const wv  =  [ ] ;

    // Initialize variables to keep track of the maximum possible total weight
    // and maximum possible total value. These are used for DP table sizing.
    let w_max  =  0 ;
    let v_max  =  0 ;


    // Loop through the remaining input lines (from the second line onwards)
    // to populate the 'wv' array and calculate 'w_max' and 'v_max'.
    for  ( var i  =  0 ;  i  <  N ;  i++  )  {
        // Each subsequent line contains two space-separated integers:
        // the weight and value of an item.
        wv . push ( input [ i  +  1 ] . split ( ' ' ) . map ( changeInt ) ) ;

        // Accumulate the total weight and value for all items.
        w_max  +=  wv [ i ] [ 0 ] ; // Add current item's weight
        v_max  +=  wv [ i ] [ 1 ] ; // Add current item's value
    }


    // After processing all input, call the 'knapsack' function
    // with all the parsed parameters and print its return value.
    console . log ( knapsack ( N , W , wv , w_max , v_max ) ) ;

}


/* This is the core dynamic programming function to solve the 0/1 Knapsack problem.
 * It aims to find the maximum total value of items that can be included
 * in a knapsack of capacity 'W' from a given set of 'N' items.
 *
 * Parameters:
 *   N     : The total number of items.
 *   W     : The maximum weight capacity of the knapsack.
 *   wv    : An array where each element is a two-element array [weight, value] for an item.
 *   w_max : The sum of all item weights (used for DP table initialization).
 *   v_max : The sum of all item values (used for DP table dimension).
 *
 * Returns:
 *   An integer representing the maximum total value achievable.
 */
function knapsack ( N , W , wv , w_max , v_max ) {

    // Initialize 'ans' to store the maximum value found.
    let ans  =  0 ;


    /* dp[i][v] will store the minimum weight required to achieve a total value 'v'
     * using items from index 'i' up to 'N-1' (inclusive) in the 'wv' array.
     * The DP table is initialized with N+1 rows and v_max+1 columns.
     */
    const dp  =  Array ( N  +  1 ) . fill ( 0 ) . map ( ( n ,  i )  =>  {
        if  ( i  ===  0 )  {
            // For the base case (dp[0]), which represents the state after considering all items,
            // or effectively, when no items are left to consider for the current subproblem.
            // Minimum weight for value 0 is 0. All other values initially require 0 weight here.
            return  Array ( v_max  +  1 ) . fill ( 0 ) ;
        }  else  {
            // For other rows (representing items from i to N-1),
            // initialize all value states (except value 0) with a very large weight (w_max).
            // This signifies that these value states are not yet reachable or are too heavy.
            // Value 0 always requires 0 weight.
            return  Array ( v_max  +  1 ) . fill ( 0 ) . fill ( w_max ,  1 ) ;
        }
    } ) ;


    // Iterate backwards through the items.
    // 'i' here represents the current item index in a 1-based fashion for DP state.
    // So, 'i-1' corresponds to the 0-based index in the 'wv' array.
    for  ( let i  =  N ;  i  >  0 ;  i--  )  {
        // Iterate backwards through all possible value states.
        for  ( let v  =  v_max ;  v  >  0 ;  v--  )  {

            // Get the weight and value of the current item being considered.
            // Remember wv array is 0-indexed, so we use i-1.
            const currentItemWeight  =  wv [ i - 1 ] [ 0 ] ;
            const currentItemValue   =  wv [ i - 1 ] [ 1 ] ;


            // Check if the current item's value is less than or equal to the target value 'v'.
            if  ( v  >=  currentItemValue )  {
                /* Option 1: Include the current item.
                 * The weight required would be its own weight plus the minimum weight
                 * needed to achieve the remaining value (v - currentItemValue)
                 * using items *after* the current one (represented by dp[i]).
                 */
                const weightIfIncluded  =  dp [ i ] [ v  -  currentItemValue ]  +  currentItemWeight ;

                /* Option 2: Exclude the current item.
                 * The weight required would be the minimum weight to achieve value 'v'
                 * using items *after* the current one (represented by dp[i]).
                 */
                const weightIfExcluded  =  dp [ i ] [ v ] ;

                // Take the minimum weight required from these two options.
                dp [ i - 1 ] [ v ]  =  Math . min ( weightIfIncluded ,  weightIfExcluded ) ;
            }  else  {
                // If the current item's value is greater than 'v',
                // we cannot include it to achieve value 'v'.
                // So, the minimum weight for 'v' is simply what was achievable
                // without considering this item (from dp[i]).
                dp [ i - 1 ] [ v ]  =  dp [ i ] [ v ] ;
            }
        }
    }


    /* After filling the entire DP table,
     * the row dp[0] contains the minimum weights to achieve various values
     * using all 'N' items.
     * We now iterate through dp[0] to find the maximum value 'v'
     * for which the required minimum weight dp[0][v] does not exceed the knapsack capacity 'W'.
     *
     * IMPORTANT: The original code iterates from i=0 to N-1 for the first index of dp.
     * This means it checks dp[0], dp[1], ..., dp[N-1].
     * While typically the final answer is derived solely from dp[0],
     * we must preserve the exact loop structure as per Type I cloning rules.
     */
    for  ( let i  =  0 ;  i  <  N ;  i++  )  {
        for  ( let v  =  0 ;  v  <=  v_max ;  v++  )  {
            // If the minimum weight required for value 'v' (using items from 'i' onwards)
            // is less than or equal to the knapsack's capacity 'W'.
            if  ( dp [ i ] [ v ]  <=  W )  {
                // Update 'ans' with the maximum value found so far.
                ans  =  Math . max ( v , ans ) ;
            }
        }
    }


    // Return the final calculated maximum value.
    return ans ;
}


// This line ensures the Main function is called when the script is executed.
// It reads the entire content of standard input as a UTF-8 string.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;