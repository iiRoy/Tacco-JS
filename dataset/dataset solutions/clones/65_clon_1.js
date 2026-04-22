/* This is a Type I clone generated from the original source code.
 * All identifiers, operators, and expressions are strictly preserved.
 * Only whitespace and comments have been altered significantly to create visual difference.
 */

//  This section handles the setup for reading input from standard input (stdin).
//  It uses the Node.js 'fs' (File System) module for synchronous file operations.
var   fs   =   require('fs')   ; //  Import the 'fs' module.

//  First, determine the size of the standard input stream's file descriptor.
var   length   =   fs.fstatSync( process.stdin.fd ).size   ;

//  Next, create a new Buffer object with the determined 'length' to hold the input data.
var   buffer   =   new   Buffer( length )   ;

//  Then, synchronously read the content from standard input into the allocated buffer.
//  Parameters: file descriptor, buffer, offset, length, position.
var   bytesRead   =   fs.readSync( process.stdin.fd ,   buffer ,   0 ,   length ,   0 )   ;

//  Finally, convert the buffer content to a UTF-8 string, remove leading/trailing whitespace,
//  and split the string into an array of lines based on newline characters.
var   input   =   buffer.toString( 'utf8' ,   0 ,   bytesRead ).trim().split( '\n' )   ;


//  Immediately invoke the main function to start the program's primary execution flow.
main()  ;


//  ----------------------------------------------------------------------------------------------------
//  The 'main' function encapsulates the core logic of the program.
//  It processes the input data to calculate final 'x' and 'y' coordinates based on
//  sequential movements and rotations.
//  ----------------------------------------------------------------------------------------------------
function   main ( )   {

    //  Initialize Cartesian coordinates 'x' and 'y' to zero.
    //  'sumt' represents the accumulated total angle in degrees.
    var   x   =   y   =   0   ;
    var   sumt   =   0   ;


    //  Iterate through each line of the 'input' array.
    //  Each line is expected to contain two comma-separated numerical values.
    for   ( var   i   =   0 ,   len   =   input.length   ;   i   <   len   ;   i ++ )   {

        //  Split the current input line by the comma delimiter.
        var   inp   =   input[ i ].split( ',' )   ;

        //  Extract the first value (radius/distance 'r') and convert it to a number.
        //  The '- 0' trick is used for explicit numeric conversion.
        var   r   =   inp[ 0 ]   -   0   ;

        //  Extract the second value (angle 't') and convert it to a number.
        var   t   =   inp[ 1 ]   -   0   ;


        //  Check for a specific termination condition: if both 'r' and 't' are zero.
        if   (   ! r   &&   ! t   )   {
            //  If the condition is met, exit the loop prematurely.
            break   ;
        }


        //  Calculate the change in the 'x' coordinate.
        //  This involves the current distance 'r' and the sine of the accumulated angle 'sumt'.
        //  The angle is converted from degrees to radians (sumt * Math.PI / 180).
        x   +=   r   *   Math.sin( sumt   *   Math.PI   /   180 )   ;

        //  Calculate the change in the 'y' coordinate.
        //  This involves the current distance 'r' and the cosine of the accumulated angle 'sumt'.
        y   +=   r   *   Math.cos( sumt   *   Math.PI   /   180 )   ;


        //  Add the current angle 't' to the total accumulated angle 'sumt'.
        sumt   +=   t   ;
    }

    //  Output the final calculated 'x' coordinate to the console.
    //  The '~~' operator is used for a fast floor-like integer truncation.
    console.log(   ~~ x   )   ;

    //  Output the final calculated 'y' coordinate to the console, also truncated.
    console.log(   ~~ y   )   ;
}