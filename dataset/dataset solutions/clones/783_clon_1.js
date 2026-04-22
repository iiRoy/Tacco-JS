/*
 * This JavaScript code processes input from standard input.
 * It simulates a change-giving machine, determining which coins
 * are returned and which are left over from an initial supply.
 */

// Import the 'fs' (file system) module, which is used for reading files.
// In this context, it reads from '/dev/stdin', representing standard input.
var input = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) ;


// Process the input:
// 1. Trim any leading/trailing whitespace from the entire input string.
// 2. Split the cleaned string into an array of lines, using the newline character as a delimiter.
var Arr = ( input.trim() ) . split( "\n" ) ;


// Initialize a variable 'j'. Although declared, it is not actively used in the provided logic.
var j = 0 ;


// Initialize an empty string 'str'. This variable will be used to accumulate
// the output results for all processed test cases before final printing.
var str = "" ;


// Begin an infinite loop to process multiple test cases.
// The loop will explicitly break when a specific condition is met.
while ( true ) {

    // Retrieve the first element from the 'Arr' array (which is a line of input).
    // The 'shift()' method removes the first element and returns it.
    // Subtracting 0 converts the string value to a number. This 'v' represents the amount paid.
    var v = Arr.shift() - 0 ;

    // Check if the amount paid 'v' is zero.
    // A value of 0 typically signals the end of the input or test cases.
    if ( v == 0 ) {
        // If 'v' is 0, exit the infinite loop.
        break ;
    }

    // Retrieve the next line from 'Arr'. This line contains space-separated counts of available coins.
    // 1. 'split(" ")' divides the string into an array of strings based on spaces.
    // 2. 'map(Number)' then converts each string element in this array to a numeric type.
    // This 'm' array holds the initial counts of 10, 50, 100, and 500 yen coins.
    var m = ( Arr.shift() ) . split( " " ) . map( Number ) ;


    // Calculate the total money received from the customer based on the available coins.
    // Then, subtract the amount 'v' (the price of the item) to determine the change to be returned.
    var money = ( ( 10 * m[0] ) + ( 50 * m[1] ) + ( 100 * m[2] ) + ( 500 * m[3] ) ) - v ;


    // Initialize an array 'M' with four zeros.
    // This array will store the counts of each coin denomination (10, 50, 100, 500 yen)
    // that need to be returned as change. M[0] for 10, M[1] for 50, etc.
    var M = [ 0, 0, 0, 0 ] ;


    // Implement a greedy algorithm to calculate the optimal change using available denominations.

    // First, handle 500-yen coins: dispense as many as possible.
    while ( 500 <= money ) {
        M[3] ++ ;      // Increment the count of 500-yen coins.
        money -= 500 ; // Reduce the remaining money to be returned.
    }

    // Next, handle 100-yen coins: dispense as many as possible from the remaining amount.
    while ( 100 <= money ) {
        M[2] ++ ;      // Increment the count of 100-yen coins.
        money -= 100 ; // Reduce the remaining money.
    }

    // Then, handle 50-yen coins: dispense as many as possible.
    while ( 50 <= money ) {
        M[1] ++ ;      // Increment the count of 50-yen coins.
        money -= 50 ;  // Reduce the remaining money.
    }

    // Finally, handle 10-yen coins: dispense as many as possible.
    while ( 10 <= money ) {
        M[0] ++ ;      // Increment the count of 10-yen coins.
        money -= 10 ;  // Reduce the remaining money.
    }


    // Define an array 'coin' that holds the actual values of the coin denominations.
    // This is used for outputting which coin denomination was involved.
    var coin = [ 10, 50, 100, 500 ] ;


    // Iterate over the initial available coin counts ('m') using the forEach method.
    // 'v' here represents the count of a specific coin denomination initially available.
    // 'i' represents the index (0 for 10-yen, 1 for 50-yen, etc.).
    m.forEach( function ( v, i ) {
        // Compare the initially available count of a coin (v) with the count of that coin
        // that was actually returned as change (M[i]).
        // If 'v' is greater than 'M[i]', it means some coins of this denomination were
        // available but not used in giving change. These are "unused" coins.
        if ( v > M[i] ) {
            // Append a line to the 'str' output string.
            // The line indicates the coin denomination (coin[i]) and the number of
            // unused coins of that denomination (v - M[i]), followed by a newline.
            str += coin[i] + " " + ( v - M[i] ) + "\n" ;
        }
    } ) ;

    // After processing a test case and appending its specific coin usage,
    // add an additional blank line to 'str' for formatting purposes,
    // separating the output of different test cases.
    str += "\n" ;

} // End of the main 'while (true)' loop.


// Once all test cases have been processed and the loop has terminated,
// print the entire accumulated 'str' to the console.
// 'str.trim()' is used to remove any trailing whitespace,
// which would include the very last extra newline added after the final test case.
console.log( str.trim() ) ;