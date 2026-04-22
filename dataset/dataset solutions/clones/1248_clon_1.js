/*
 * This JavaScript program processes numerical input
 * from the standard input stream (stdin).
 * It calculates the area and circumference of a circle
 * based on a provided radius, then outputs these values.
 * This script is designed for environments where input
 * is piped or typed into the console.
 */

// The 'process.stdin.resume()' method ensures that the
// standard input stream remains open, allowing data to be
// read even if there are no explicit listeners initially.
process.stdin.resume( );

// Set the character encoding for incoming data on stdin.
// 'utf8' is a common and widely supported encoding.
process.stdin.setEncoding(  'utf8'  ) ;

// Attach an event listener to the 'data' event of the
// standard input stream. This function will be called
// whenever new data is available from stdin.
process.stdin.on (  'data'  ,  function ( chunk ) {

    // Convert the received data 'chunk' to a string.
    // Then, split the string by spaces to get an array of string numbers.
    // Finally, use 'map(Number)' to convert each string element to a numeric type.
    var   line   =   chunk . toString ( ) . split ( ' ' ) . map ( Number ) ;

    // The first element of the 'line' array is expected to be the radius.
    // We explicitly convert it to a Number to ensure type consistency,
    // though 'map(Number)' should have already done this.
    var   r   =   Number ( line [ 0 ] ) ;

    // Calculate the area of the circle.
    // The formula for the area of a circle is π * r^2 (pi times radius squared).
    var   enn   =   r  *  r  *  Math.PI  ;

    // Calculate the circumference of the circle.
    // The formula for the circumference is 2 * π * r (two times pi times radius).
    var   nagasa   =   2  *  r  *  Math.PI  ;

    // Output the calculated circumference and area to the console.
    // They are concatenated with a space in between for readability.
    console . log ( nagasa  +  ' '  +  enn ) ;

} ) ; // End of the 'data' event handler function.