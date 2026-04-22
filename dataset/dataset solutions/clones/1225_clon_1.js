// This script processes input from standard input to determine
// if a certain geometric condition is met based on given dimensions and a circle's properties.

'use strict' ; // Enforce strict mode for better error handling and cleaner code practices.

// Attach a 'data' event listener to the standard input stream.
// This function will be invoked whenever new data becomes available on stdin.
process . stdin . on ( 'data' ,   function  ( chunk )   {

    // Convert the incoming data chunk to a string,
    // remove any leading or trailing whitespace,
    // and then split the string into an array of substrings using space as a delimiter.
    var inputs  =  chunk . toString ( ) . trim ( ) . split ( ' ' ) ;


    // Parse the string inputs into numerical variables for calculations.
    // W represents the width of a bounding box or area.
    var W   =   Number ( inputs [ 0 ] ) ;
    // H represents the height of the bounding box or area.
    var H   =   Number ( inputs [ 1 ] ) ;
    // x represents the x-coordinate of a circle's center.
    var x   =   Number ( inputs [ 2 ] ) ;
    // y represents the y-coordinate of a circle's center.
    var y   =   Number ( inputs [ 3 ] ) ;
    // r represents the radius of the circle.
    var r   =   Number ( inputs [ 4 ] ) ;


    // Perform calculations to determine specific coordinates, possibly for a transformed or reflected circle.
    // x0: A derived x-coordinate.
    var x0  =  W  -  x  -  r ;
    // x1: Another derived x-coordinate.
    var x1  =  W  -  x  +  r ;
    // y0: A derived y-coordinate.
    var y0  =  H  -  y  -  r ;
    // y1: Another derived y-coordinate.
    var y1  =  H  -  y  +  r ;


    // Evaluate a complex geometric condition based on the calculated coordinates.
    // The condition checks if x0 is non-negative, x1 is within W, y0 is non-positive, and y1 is at least H.
    if  (  x0  >=  0  &&  x1  <=  W  &&  y0  <=  0  &&  y1  >=  H  )
    {
        // If all parts of the condition are met, print 'Yes' to standard output.
        console . log ( 'Yes' ) ;
    }
    else
    {
        // Otherwise, if the condition is not fully met, print 'No'.
        console . log ( 'No' ) ;
    }

} ) ; // End of the 'data' event handler function.


// Resume the standard input stream. This action is crucial for the 'data' event listener
// to actually receive and process incoming data.
process . stdin . resume ( ) ;

// Set the character encoding for the standard input stream to 'utf8'.
// This ensures that multi-byte characters are correctly interpreted.
process . stdin . setEncoding ( 'utf8' ) ;