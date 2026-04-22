/*
 * This JavaScript file processes input from standard input.
 * It reads lines, performs calculations, and prints results to console.
 */
var    input = require('fs').readFileSync( '/dev/stdin' ,  'utf8' ); // Read entire input from stdin

// Trim whitespace from input and split into an array of lines
var Arr = ( input.trim() ) .split( "\n" );

// Main processing loop: continues until a specific condition is met
while ( true )
{
    // Extract the first number from the array and convert to a numeric type
    var a0 = Arr.shift() - 0 ;
    /*
     * If the first number is zero, it's a termination condition.
     * Exit the loop.
     */
    if ( a0 == 0 )
        break ;

    // Read the next four numbers from the input array
    var a1 = Arr.shift() - 0 ;
    var a2 = Arr.shift() - 0 ;
    var a3 = Arr.shift() - 0 ;
    var a4 = Arr.shift() - 0 ;

    // Create a new array containing the five numbers just read
    var arr = [ a0 , a1 , a2 , a3 , a4 ] ;

    // Initialize an array representing possible values (e.g., Rock, Paper, Scissors)
    var rps = [ 1 , 2 , 3 ] ;

    // Filter out values from 'rps' that are present in the 'arr' of input numbers
    rps = rps.filter( function( v ) {
        // Return true if 'v' is not equal to any of the input numbers
        return ( v != a0  &&  v != a1  &&  v != a2  &&  v != a3  &&  v != a4 ) ;
    } ) ;

    // Check the length of the filtered 'rps' array
    if ( rps.length == 2  ||  rps.length == 0 )
    {
        // If length is 2 or 0, print '3' five times
        for ( var i = 0 ; i < 5 ; i++ )
            console.log( 3 ) ;
    }
    else
    {
        // Otherwise, iterate through the 'arr' of input numbers
        arr.forEach( function( v ) {
            // Depending on the remaining 'rps' value, apply specific logic
            if ( rps[0] == 1 )
                console.log( ( v == 2 ) ? 2 : 1 ) ; // If rps[0] is 1
            if ( rps[0] == 2 )
                console.log( ( v == 1 ) ? 2 : 1 ) ; // If rps[0] is 2
            if ( rps[0] == 3 )
                console.log( ( v == 1 ) ? 1 : 2 ) ; // If rps[0] is 3
        } ) ;
    }


} // End of the main while loop