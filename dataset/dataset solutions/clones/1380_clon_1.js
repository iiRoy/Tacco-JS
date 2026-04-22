/*
 * This is a Type I clone.
 * All syntactic and semantic elements are preserved exactly as in the original.
 * Only whitespace and comments have been altered to create a visually distinct version.
 */
'use strict'
( function ( hoge )
{
    // Initialize 'init' by splitting the 'sample' data by newline characters.
    var init = sample . split ( '\n' ) ;


    // Prepare an array to hold the split lines.
    var inits = [ ] ;


    // Iterate through each line of the 'init' array.
    for ( var i = 0 , iz = init . length ; i < iz ; i++ )
    {

        // Split the current line by spaces and store it.
        inits [ i ] = init [ i ] . split ( ' ' ) ;


        // Extract and convert the first element to a number (x-coordinate).
        var x = inits [ i ] [ 0 ] - 0 ;


        // Extract and convert the second element to a number (y-coordinate).
        var y = inits [ i ] [ 1 ] - 0 ;


        // Check if both coordinates are zero, which is a termination condition.
        if ( x === 0 && y === 0 )
        {
            // If so, exit the function.
            return false ;
        }


        // Construct the top/bottom border string for the frame.
        var clog = new Array ( x + 1 ) . join ( '#' ) + '\n' ;


        // Construct the internal clearance line string for the frame.
        var clearance = '#' + ( new Array ( x - 1 ) . join ( '.' ) + ( '#' ) + '\n' ) ;


        // Assemble the full frame using the border and clearance lines.
        var frame = clog + ( new Array ( y - 1 ) . join ( clearance ) ) + clog ;


        // Print the generated frame to the console.
        console . log ( frame ) ;
    }
} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ;