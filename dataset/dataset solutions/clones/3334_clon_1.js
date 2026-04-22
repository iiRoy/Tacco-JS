/*
 * This file contains the main logic for processing input
 * and solving a problem using dynamic programming.
 */

function Main  (  input  )   {
    // The main entry point of the program.
    // It takes raw input, processes it, and then calls the DP function.

    input = input
        .trim() // Remove leading/trailing whitespace.
        .split("\n") // Split input into lines.
        .map(function(x) {
            // For each line, split it by spaces.
            return x.split(" ")
        });
    ; // An extra semicolon, valid but uncommon.

    let N   =  parseInt( input[0][0] ,   10 ) ; // Parse N from the first element.

    // 'a' stores the array of numbers for the DP calculation.
    a = input[1] . map ( e  =>  parseInt( e ,  10 ) ) ;

    /*
     * Initialize the kukanDP (interval DP) table.
     * It's a 2D array to store memoized results.
     */
    kukanDP = Array.from ( { length: N } ,  ( )  =>  [ ] ) ;


    // Call the DP function with the initial interval [0, N-1]
    // and print its result to the console.
    console . log (  DP ( 0 ,  N - 1 )  ) ;

} // End of Main function.


/*
 * DP function calculates the maximum value for a given interval [l, r].
 * This is a recursive function with memoization.
 */
function  DP  (  l  ,  r  )
{
    // Check if the result for this interval [l, r] is already computed (memoization).
    if  (  kukanDP [ l ] [ r ]  !=  null  )
    {
        return kukanDP [ l ] [ r ] ;
    }

    // Base case 1: Interval of length 2 (r = l + 1)
    if  (  r  ===  l  +  1  )
    {
        // For an interval [l, r] of length 2, the value is the absolute difference.
        kukanDP[l][r] = Math.abs(a[l] - a[r]);
        return  kukanDP[l][r] ;
    }

    // Base case 2: Interval of length 1 (r = l)
    if ( r  ===  l )
    {
        // For an interval [l, r] of length 1, the value is just a[l].
        kukanDP[l][r] = a[l] ;
        return kukanDP[l][r] ;
    }

    // Recursive step: Calculate two possibilities and take the maximum.
    // Possibility 1: Take a[l] and subtract the result of DP on [l+1, r].
    let  tmp1  =  a [ l ]  -  DP ( l  +  1 ,  r ) ;

    // Possibility 2: Take a[r] and subtract the result of DP on [l, r-1].
    let  tmp2  =  a [ r ]  -  DP ( l ,  r  -  1 ) ;

    // Store the maximum of the two possibilities in the DP table.
    kukanDP [ l ] [ r ]  =  Math . max ( tmp1  ,  tmp2 ) ;
    return  kukanDP [ l ] [ r ] ;

} // End of DP function.


// Invoke the Main function with input read from standard input.
Main( require("fs") . readFileSync( "/dev/stdin" , "utf8" ) ) ;
// This line executes the program.