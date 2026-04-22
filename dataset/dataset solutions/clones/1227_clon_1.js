// This JavaScript program is designed to process input from standard input.
// It determines whether a given circle is contained within a rectangle.

'use strict' ; // Enforces strict mode, which helps catch common coding errors and "unsafe" actions.

( function ( stdin ) { // This is an Immediately Invoked Function Expression (IIFE) that takes 'stdin' as an argument.

    // Reads the entire content of 'stdin' (standard input) and converts it to a string.
    var   inputs =   stdin . toString ( ) ;

    // Processes the input string to extract parameters.
    // 1. Splits the input by newline characters.
    // 2. Selects the first line (index 0).
    // 3. Splits that first line by space characters.
    // 4. Converts each resulting string segment into a number.
    // These numbers are expected to be: Width, Height, circleX, circleY, Radius.
    var params = inputs . split ( '\n' ) [ 0 ] . split ( ' ' ) . map ( Number ) ;

    // Another IIFE, nested within the first, to handle the parsed parameters.
    ( function ( W , H , x , y , r ) { // Parameters are named for clarity: Width, Height, x-coord, y-coord, radius.

        // The following 'if' condition checks if the circle is outside the rectangle's bounds.
        // Note: The comma operator (',') evaluates each expression from left to right and
        // returns the value of the last expression. So, the effective condition for the 'if'
        // statement is actually only 'y + x > H'. This preserves the original logic/potential bug.
        if ( x - r < 0 , y - r < 0 , x + r > W , y + x > H ) {
            // If the effective condition (y + x > H) is true, it means the circle is considered 'No'.
            console . log ( 'No' ) ;
        } else {
            // Otherwise, if the effective condition is false, the circle is considered 'Yes'.
            console . log ( 'Yes' ) ;
        }

    } ( params [ 0 ] , params [ 1 ] , params [ 2 ] , params [ 3 ] , params [ 4 ] ) ) ; // Invokes the inner IIFE with array elements.
    // params[0] becomes W
    // params[1] becomes H
    // params[2] becomes x
    // params[3] becomes y
    // params[4] becomes r

} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ; // Invokes the outer IIFE.
// It passes the content of '/dev/stdin' (read synchronously as UTF-8) as the 'stdin' argument.