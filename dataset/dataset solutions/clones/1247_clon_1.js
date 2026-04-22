/*
 * This script processes input from standard input to calculate
 * the area and circumference of a circle.
 * It expects a single number (radius) as input.
 */

// Set the encoding for standard input to UTF-8.
process.stdin.setEncoding( 'utf-8' ) ;


// Listen for 'data' events on standard input.
process.stdin.on( 'data' ,  ( input )  =>  {

    // Split the input string by space to get an array of values.
    // In this case, we expect only one number.
    var  arry  =  input.split( ' ' ) ;

    // Parse the first element of the array as an integer, which represents the radius.
    var  r  =  parseInt( arry[ 0 ] ) ;

    // Calculate the area of the circle using the formula: A = π * r^2
    var  a  =  r  *  r  *  Math.PI ;

    // Calculate the circumference of the circle using the formula: C = 2 * π * r
    var  b  =  2  *  r  *  Math.PI ;


    // Format the area and circumference to 5 decimal places and concatenate them
    // with a space in between.
    var  output  =  a.toFixed( 5 )  +  ' '  +  b.toFixed( 5 ) ;

    // Print the final output to the console (standard output).
    console.log( output ) ;

} ) ; // End of 'data' event listener.

// The script will keep running, waiting for input, until stdin is closed.