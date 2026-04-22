/*
 * This is a Type I clone of an existing JavaScript program.
 * All identifiers, operators, and expressions are strictly preserved.
 * Only whitespace and comments have been altered significantly.
 * This version aims to be visually distinct from the original.
 */
"use strict" ; // Enforce strict mode for better error handling and cleaner code.


/**
 * Dynamically creates a multi-dimensional array based on input dimensions.
 * The 'v' parameter specifies the initial value for the innermost array elements.
 * Example: xArray("hello", 2, 3) would create Array(2).fill(0).map(x=>Array(3).fill(0).map(x=>{return "hello";}))
 *
 * @param {any} v - The value to fill the innermost array elements with.
 * @returns {Array} A new multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments , l = a . length ,
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})" ;

    // Loop backward through the arguments to build the nested array creation string.
    while ( --l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    // Evaluate the dynamically created string to produce the array.
    return eval ( r ) ;
}


// Define a simple mapping object: 'R' maps to 'B', and 'B' maps to 'R'.
var v = { R : "B" , B : "R" } ;


// Initialize the readline interface for interactive input/output.
// This allows reading input line by line from process.stdin and writing to process.stdout.
const rl = require ( "readline" ) . createInterface ( process . stdin , process . stdout ) ;


/*
 * This is the main generator function that encapsulates the problem-solving logic.
 * It uses `yield` to pause execution and wait for asynchronous input from `rl`.
 */
const g = ( function* ( ) {

    // A helper function that returns a Promise-like object to get a single line of input.
    // It uses `rl.once` to listen for the 'line' event and then advances the generator.
    const gets = ( ) => rl . once ( "line" , s => g . next ( s ) ) ;


    var ans = [ ] ; // Initialize an empty array to store the final answer sequence.


    // Get the initial value for 'n' from the first line of input.
    var n = yield gets ( ) ;
    n = + n ; // Convert the string input 'n' to a numerical type.


    var n2 = 2 * n ; // Calculate 2n, which is used multiple times in the logic.


    var p = [ ] ; // Initialize array 'p', which will be used for constructing queries.


    // Populate the 'p' array with a sequence from 1 to n for the first query.
    for ( var i = 1 ; i <= n ; i ++ ) {
        p [ i - 1 ] = i ;
    }


    // Output the first query to the console, joining elements of 'p' with spaces.
    console . log ( "?" , p . join ( " " ) ) ;
    var s = yield gets ( ) ; // Receive the response to the first query.


    // Initialize variables for a binary search-like process.
    var l = 1 , r = n + 1 , x ;


    // Loop to perform a kind of binary search to determine a key value 'x'.
    while ( r - l > 1 ) {
        x = r + l + 1 >> 1 ; // Calculate the midpoint using bitwise right shift for efficiency.

        // Construct the query array 'p' based on the current 'x' value.
        for ( var i = 0 ; i < n ; i ++ ) {
            p [ i ] = x + i ;
        }

        // Output the query and get the response.
        console . log ( "?" , p . join ( " " ) ) ;
        var t = yield gets ( ) ;

        // Adjust the search range based on whether the first character of 's' matches 't'.
        if ( s [ 0 ] !== t [ 0 ] ) {
            r = x ; // If different, adjust the upper bound.
        }
        else {
            l = x ; // If same, adjust the lower bound.
        }
    }


    x = r ; // The determined key value 'x' is now set to 'r'.


    // Based on 'x' and 's', populate two positions in the 'ans' array.
    ans [ x - 2 ] = s [ 0 ] ;
    ans [ x - 2 + n ] = v [ s [ 0 ] ] ; // Use the mapping 'v' for the second position.


    var q = [ ] ; // Initialize array 'q' for alternative queries.
    var set = new Set ( ) ; // Initialize a Set to keep track of elements already considered.


    // Populate 'p', 'q', and 'set' for the subsequent query phase.
    for ( var i = 0 ; i < n - 1 ; i ++ ) {
        p [ i ] = ( x + i ) % ( 2 * n ) ; // Calculate elements for 'p' using modulo arithmetic.
        q [ i ] = ( p [ i ] + n - 1 ) % ( 2 * n ) + 1 ; // Calculate elements for 'q'.
        set . add ( p [ i ] ) ; // Add elements of 'p' to the set.
    }


    // Iterate through all possible indices from 1 to 2*n to complete the 'ans' array.
    for ( var i = 1 ; i <= 2 * n ; i ++ ) {
        // If the current position in 'ans' is already filled, skip to the next.
        if ( ans [ i - 1 ] ) {
            continue ;
        }

        // Check if the current index 'i' is present in the 'set'.
        if ( set . has ( i ) ) {
            q [ n - 1 ] = i ; // If in set, use 'q' array for the query, placing 'i' at the last position.
            console . log ( "?" , q . join ( " " ) ) ; // Output the query.
            var t = yield gets ( ) ; // Get the response.

            // Assign 'R' or 'B' to 'ans' based on the response.
            if ( t [ 0 ] === "R" ) {
                ans [ i - 1 ] = "R" ;
            }
            else {
                ans [ i - 1 ] = "B" ;
            }
        }
        else {
            p [ n - 1 ] = i ; // If not in set, use 'p' array for the query, placing 'i' at the last position.
            console . log ( "?" , p . join ( " " ) ) ; // Output the query.
            var t = yield gets ( ) ; // Get the response.

            // Assign 'R' or 'B' to 'ans' based on the response.
            if ( t [ 0 ] === "R" ) {
                ans [ i - 1 ] = "R" ;
            }
            else {
                ans [ i - 1 ] = "B" ;
            }
        }
    }

    // Finally, output the complete answer by joining the elements of 'ans'.
    console . log ( "!" , ans . join ( "" ) ) ;

} ) ( ) ; // Immediately invoke the generator function.


// Start the generator execution by calling its 'next()' method.
g . next ( ) ;