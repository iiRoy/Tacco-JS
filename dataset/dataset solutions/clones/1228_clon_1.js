'use strict';

/*
 * This file presents a JavaScript program that processes
 * standard input to determine a geometric condition.
 * It is a Type I clone, meaning its functional behavior
 * and underlying structure are identical to an original source,
 * with modifications limited strictly to whitespace and comments.
 */

( function ( stdin ) {

    // The raw input data is read from stdin and converted to a string.
    var inputs = stdin . toString ( ) ;

    // The first line of input is parsed.
    // It's split by newline, then the first element is taken,
    // then split by space, and each resulting string is converted to a Number.
    var params = inputs . split ( '\n' ) [ 0 ] . split ( ' ' ) . map ( Number ) ;

    // An Immediately Invoked Function Expression (IIFE) is defined and executed.
    // It takes five parameters: W (width), H (height), x (x-coordinate), y (y-coordinate), and r (radius).
    ( function ( W , H , x , y , r ) {

        // The original comment was non-descriptive.
        // This conditional block evaluates if a circle (defined by x, y, r)
        // is considered "out of bounds" within a rectangle (defined by W, H).
        // Note: The use of the comma operator here means only the result of the last
        // expression (y + x > H) will determine the outcome of the 'if' statement.
        if ( x - r < 0 , y - r < 0 , x + r > W , y + x > H ) {
            // If the condition evaluates to true (i.e., y + x > H is true),
            // then 'No' is printed to the console.
            console . log ( 'No' ) ;
        } else {
            // Otherwise, 'yes' is printed to the console.
            console . log ( 'yes' ) ;
        }

    } ( params [ 0 ] , params [ 1 ] , params [ 2 ] , params [ 3 ] , params [ 4 ] ) ) ; // End of the inner IIFE.

} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ; // End of the outer IIFE, which reads from /dev/stdin.