( function( hoge )
{
    // This variable 'init' will store the lines read from the input source.
    var init  =  sample.split( '\n' ) ;

    // An array to hold the parsed individual segments from each line.
    var inits  =  [ ] ;


    // Loop through each processed line obtained from the input.
    for ( var i = 0 , iz = init.length ;  i < iz ;  i++ )
    {
        // Split the current line by spaces to get individual components (e.g., x and y coordinates).
        inits[ i ]  =  init[ i ].split( ' ' ) ;


        // Convert the first component to a number, representing the 'x' dimension.
        var x  =  inits[ i ][ 0 ]  -  0 ;

        // Convert the second component to a number, representing the 'y' dimension.
        var y  =  inits[ i ][ 1 ]  -  0 ;


        // Check for the termination condition: if both x and y are zero, the program should stop.
        if ( x  ===  0  &&  y  ===  0 )
        {
            // Exit the function if the termination condition is met.
            return ;
        }


        /*
         *   The 'clog' variable represents a solid line made of hash characters.
         *   It's used for the top and bottom borders of the frame.
         *   The length is 'x + 1' hashes, followed by a newline character.
         */
        var clog  =  new Array( x + 1 ).join( '#' )  +  '\n' ;


        /*
         *   The 'clearance' variable represents a single inner row of the frame.
         *   It starts with a hash, then 'x - 1' dots, another hash, and finally a newline.
         *   This creates the pattern: #.......#
         */
        var clearance  =  '#'  +  ( new Array( x  -  1 ).join( '.' )  +  ( '#' )  +  '\n' ) ;


        // Construct the full 'frame' by combining the borders and inner rows.
        // It's 'clog' (top), followed by 'y - 1' repetitions of 'clearance' (middle),
        // then 'clog' again (bottom), and an extra newline for spacing.
        var frame  =  clog  +  ( new Array( y - 1 ).join( clearance ) )  +  clog  +  '\n' ;


        // Output the fully constructed frame to the console.
        console.log( frame ) ;
    }
// The immediately invoked function expression (IIFE) is called with the content
// of '/dev/stdin' read as a UTF-8 string.
}( require( 'fs' ).readFileSync( '/dev/stdin' ,  'utf8' ) ) ) ;