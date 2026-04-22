/*
 * This JavaScript code processes a series of numbers from standard input.
 * It simulates a change-making problem, calculating the minimum number of
 * coins needed for a given amount, assuming a specific set of denominations.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Import the 'fs' module for file system operations.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');


// Process the input string:
// 1. Trim whitespace from the start/end.
// 2. Split into an array of strings by newline characters.
// 3. Convert each string to a Number.
var Arr = ( input.trim() ) . split ( "\n" ) . map ( Number ) ;

// Loop through each number in the processed array.
for ( var i = 0 ; i < Arr . length ; i ++ )
{
    // Get the current value from the array.
    var v = Arr [ i ] ;

    // Initialize sum for counting coins.
    var sum = 0 ;

    // If the input value is 0, terminate the loop.
    if ( v == 0 )
    {
        break ;
    }

    // Calculate the amount to make change for (1000 - input value).
    v = 1000 - v ;

    // Check for 500-unit coin.
    if ( v >= 500 )
    {
        sum ++ ; // Increment coin count.
        v = v - 500 ; // Subtract coin value.
    }

    // Add count for 100-unit coins.
    sum += Math . floor ( v / 100 ) ;
    v = v % 100 ; // Remaining value after 100-unit coins.

    // Check for 50-unit coin.
    if ( v >= 50 )
    {
        sum ++ ; // Increment coin count.
        v = v - 50 ; // Subtract coin value.
    }

    // Add count for 10-unit coins.
    sum += Math . floor ( v / 10 ) ;
    v = v % 10 ; // Remaining value after 10-unit coins.

    // Check for 5-unit coin.
    if ( v >= 5 )
    {
        sum ++ ; // Increment coin count.
        v = v - 5 ; // Subtract coin value.
    }

    // The remaining 'v' represents 1-unit coins.
    // Log the total sum of coins.
    console . log ( sum + v ) ;
}

// End of file.