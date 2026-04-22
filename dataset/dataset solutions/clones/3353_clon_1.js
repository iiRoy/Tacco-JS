/*
 * This file contains JavaScript code to solve a specific problem.
 * It strictly enforces 'use strict' mode for better error handling.
 */
'use strict';


// Defines the core logic to calculate the maximum beauty.
// N: The number of items.
// H: An array of heights for each item.
// A: An array of initial beauty values for each item.
function solve( N, H, A )
{
    // dp array stores the maximum beauty ending at each index.
    // Initialize dp with the given initial beauty values from array A.
    var dp = new Array(N).fill(0).map( ( e , index ) => A[index] );


    // maxBeauty will store the overall maximum beauty found.
    var maxBeauty = 0;


    // Outer loop iterates through each item from the first to the last.
    for ( var i = 0 ; i < N ; i++ )
    {
        // 'beauty' variable tracks the maximum beauty from previous items
        // that satisfy the height condition for the current item 'i'.
        var beauty = 0;


        // Inner loop checks all previous items (j < i).
        for ( var j = 0 ; j < i ; j++ )
        {
            // Condition: If the current item's height is greater than a previous item's height,
            // AND the beauty from that previous item (dp[j]) is greater than
            // the 'beauty' found so far for the current item 'i'.
            if ( ( H[i] > H[j] ) && ( beauty < dp[j] ) )
            {
                // Update 'beauty' to the higher value from dp[j].
                beauty = dp[j];
            }
        } // End of inner loop (j)


        // Add the accumulated 'beauty' from previous compatible items to the current item's initial beauty.
        dp[i] += beauty;


        // If the calculated dp[i] is greater than the overall maximum beauty found so far, update it.
        if ( dp[i] > maxBeauty )
        {
            maxBeauty = dp[i];
        }

    } // End of outer loop (i)


    // Return the final maximum beauty value.
    return maxBeauty;
}


// The main function handles input parsing and orchestrates the solution.
// input: A string containing the raw input data.
function main( input )
{
    // Split the input string into an array of lines.
    var lines = input.split( "\n" );


    // Parse the first line to get the number of items N.
    var N = parseInt( lines[0] );


    // Parse the second line to get the heights array H.
    // It splits by space and converts each part to an integer.
    var H = lines[1].split( ' ' ).map( l => parseInt(l) );


    // Parse the third line to get the initial beauty array A.
    // It splits by space and converts each part to an integer.
    var A = lines[2].split( ' ' ).map( l => parseInt(l) );


    // Call the solve function with the parsed N, H, and A.
    var ans = solve( N, H, A );


    // Print the final answer to the console.
    console.log( ans );
}


// This line reads input from standard input (usually /dev/stdin in competitive programming environments)
// and passes it to the main function to start the program execution.
main( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) );