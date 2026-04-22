"use strict" ; /* This directive enforces strict mode for the entire script. */


function    xArray ( v )
{
    // Declare variables for arguments, length, and the resulting string
    var   a = arguments ,
          l = a . length ,
          r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})" ;

    /*
     * This loop constructs the nested Array.map calls.
     * It iterates backward from 'l' (length - 1) down to 1.
     */
    while ( --l )
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;

    // Finally, evaluate the constructed string as JavaScript code.
    return eval ( r ) ;
}


const   rl = require ( "readline" ) . createInterface ( process . stdin , process . stdout ) ;

/*
 * This is a generator function 'g' which handles asynchronous input
 * using readline and 'yield'.
 */
const   g = ( function* ( )
{
    // Helper function to get the next line from readline.
    const   gets = ( ) => rl . once ( "line" , s => g . next ( s ) ) ;


    var   n = yield gets ( ) ; // Yield control and wait for the first input line (value of n).
    n = +n ;                     // Convert the input string 'n' to a number.

    var   p = [ ] ;              // Initialize an empty array 'p'.

    // Populate array 'p' with numbers from 1 to 'n'.
    for ( var i = 1 ; i <= n ; i++ )
        p [ i - 1 ] = i ;

    // Output the first query.
    console . log ( "?" , p . join ( " " ) ) ;
    var   s = yield gets ( ) ;   // Get the response to the first query.

    var   x = 1 ;                // Initialize 'x' for the while loop.

    /*
     * This loop finds the value of 'x' based on the responses 's' and 't'.
     * It modifies 'p' and makes queries until 's[0]' and 't[0]' differ.
     */
    while ( 1 )
    {
        p [ x - 1 ] = x + n ;    // Modify an element in 'p'.
        console . log ( "?" , p . join ( " " ) ) ; // Output the next query.
        var   t = yield gets ( ) ; // Get the response to the current query.
        if ( s [ 0 ] !== t [ 0 ] ) // Check if the first characters of responses differ.
            break ;              // If they differ, exit the loop.
        x++ ;                    // Increment 'x' if responses are the same.
    }

    var   ans = [ ] ;            // Initialize an empty array for the final answer.
    var   q = [ ] ;              // Initialize another empty array 'q'.
    var   set = new Set ( ) ;    // Create a new Set to store certain values.

    /*
     * This loop populates parts of 'p', 'q', and 'set'.
     */
    for ( var i = 0 ; i < n - 1 ; i++ )
    {
        p [ i ] = ( x + i - 1 ) % ( 2 * n ) + 1 ; // Calculate value for p[i].
        q [ i ] = ( p [ i ] + n - 1 ) % ( 2 * n ) + 1 ; // Calculate value for q[i].
        set . add ( i + x ) ;    // Add a value to the 'set'.
    }

    /*
     * This main loop iterates from 1 to 2*n to determine 'R' or 'B' for each position.
     */
    for ( var i = 1 ; i <= 2 * n ; i++ )
    {
        if ( set . has ( i ) )
        {
            q [ n - 1 ] = i ;    // Assign 'i' to q[n-1] if 'set' contains 'i'.
            console . log ( "?" , q . join ( " " ) ) ; // Output query with array 'q'.
            var   t = yield gets ( ) ; // Get response.
            if ( t [ 0 ] === "R" )
                ans [ i - 1 ] = "R" ; // If response starts with 'R', set 'ans' element to 'R'.
            else
                ans [ i - 1 ] = "B" ; // Otherwise, set it to 'B'.
        }
        else
        {
            p [ n - 1 ] = i ;    // Assign 'i' to p[n-1] if 'set' does not contain 'i'.
            console . log ( "?" , p . join ( " " ) ) ; // Output query with array 'p'.
            var   t = yield gets ( ) ; // Get response.
            if ( t [ 0 ] === "R" )
                ans [ i - 1 ] = "R" ; // If response starts with 'R', set 'ans' element to 'R'.
            else
                ans [ i - 1 ] = "B" ; // Otherwise, set it to 'B'.
        }
    }

    console . log ( "!" , ans . join ( "" ) ) ; // Output the final answer.
} ) ( ) ;

g . next ( ) ; // Start the generator function.