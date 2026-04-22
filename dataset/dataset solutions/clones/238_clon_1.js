/*
 * This JavaScript file processes input data
 * to determine if two rectangles overlap.
 * It reads standard input, parses coordinates,
 * and outputs 'YES' or 'NO' for each pair.
 */

// Core Node.js module for file system operations
var fs       =       require('fs')        ;

// Determine the size of the standard input stream
var length   =   fs.fstatSync( process.stdin.fd ).size   ;

// Allocate a buffer to hold the input data
var buffer   =   new   Buffer( length )   ;

// Read the entire standard input into the buffer
var bytesRead = fs.readSync( process.stdin.fd, buffer, 0, length, 0 ) ;

// Convert the buffer to a UTF-8 string, trim whitespace, and split by newlines
var input    =   buffer.toString( 'utf8', 0, bytesRead ) .trim() .split( '\n' )   ;


// Call the main processing function
main()    ;



function main(  )
{
    /*
     * Iterate through each line of the input.
     * Each line represents a test case with rectangle coordinates.
     */
    for ( var i = 0, len = input.length ; i < len ; i++ )
    {
        // Parse the current line: split by space and convert to numbers
        var c = input[i].split( ' ' ).map( Number ) ;


        // Extract coordinates for the first rectangle (A)
        var xa1 = c[0] ; // X-coordinate of rectangle A's top-left corner
        var ya1 = c[1] ; // Y-coordinate of rectangle A's top-left corner
        var xa2 = c[2] ; // X-coordinate of rectangle A's bottom-right corner
        var ya2 = c[3] ; // Y-coordinate of rectangle A's bottom-right corner

        // Extract coordinates for the second rectangle (B)
        var xb1 = c[4] ; // X-coordinate of rectangle B's top-left corner
        var yb1 = c[5] ; // Y-coordinate of rectangle B's top-left corner
        var xb2 = c[6] ; // X-coordinate of rectangle B's bottom-right corner
        var yb2 = c[7] ; // Y-coordinate of rectangle B's bottom-right corner


        /*
         * Check for overlap between rectangle A and rectangle B.
         * Two rectangles overlap if they overlap on both X and Y axes.
         * X-axis overlap: xa1 <= xb2 && xb1 <= xa2
         * Y-axis overlap: ya1 <= yb2 && yb1 <= ya2
         */
        var r = ( ( xa1 <= xb2 ) && ( xb1 <= xa2 ) )
             && ( ( ya1 <= yb2 ) && ( yb1 <= ya2 ) ) ;


        // Output the result: 'YES' if they overlap, 'NO' otherwise
        console.log( r ? 'YES' : 'NO' ) ;
    }
}