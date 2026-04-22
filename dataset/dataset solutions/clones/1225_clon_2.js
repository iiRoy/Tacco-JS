'use strict'; // Enforce strict mode for modern JavaScript practices.

// Set up an event listener for incoming data from the standard input stream.
process.stdin.on ( 'data',   function ( inputSegment ) {
    // Convert the received data block to a string, trim any leading/trailing whitespace,
    // and then split it into an array of strings based on space delimiters.
    let  parsedValues  = inputSegment . toString (  ) . trim (  ) . split ( ' ' ) ;

    // Parse the numerical values from the `parsedValues` array.
    // These represent the dimensions of a container and the properties of a circle.
    const fieldWidth    = Number ( parsedValues [ 0 ] ) ; // The total width of the containing area.
    const fieldHeight   = Number ( parsedValues [ 1 ] ) ; // The total height of the containing area.
    const centerX       = Number ( parsedValues [ 2 ] ) ; // The X-coordinate of the circle's center.
    const centerY       = Number ( parsedValues [ 3 ] ) ; // The Y-coordinate of the circle's center.
    const circleRadius  = Number ( parsedValues [ 4 ] ) ; // The radius of the circle.

    // Calculate transformed boundary coordinates for the circle based on the given logic.
    // These calculations seem to be determining if a circle, when its center is treated as
    // an offset from the bottom-right corner, fits within a rectangle.
    const leftBoundary   = fieldWidth  - centerX - circleRadius ; // Derived left-most point.
    const rightBoundary  = fieldWidth  - centerX + circleRadius ; // Derived right-most point.
    const upperBoundary  = fieldHeight - centerY - circleRadius ; // Derived top-most point.
    const lowerBoundary  = fieldHeight - centerY + circleRadius ; // Derived bottom-most point.

    // Check if the calculated boundaries satisfy the specific fitting conditions.
    // The conditions imply that the transformed circle must be contained within
    // the boundaries of a transformed rectangle (0 to fieldWidth for X, 0 to fieldHeight for Y).
    if ( ( leftBoundary >= 0 ) && ( rightBoundary <= fieldWidth ) && ( upperBoundary <= 0 ) && ( lowerBoundary >= fieldHeight ) )
    {
        // If all conditions are met, output 'Yes'.
        console . log ( 'Yes' ) ;
    }
    else
    {
        // Otherwise, if any condition fails, output 'No'.
        console . log ( 'No' ) ;
    }
} ) ; // End of the 'data' event handler function.

// Ensure that the standard input stream remains active and does not close prematurely.
process.stdin.resume (  ) ;
// Specify the character encoding for the standard input to ensure correct interpretation of data.
process.stdin.setEncoding ( 'utf8' ) ;