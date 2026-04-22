/*
 * This script is designed to process numerical input provided via standard input.
 * It reads lines of space-separated coefficients and constants,
 * then solves a system of two linear equations for each line.
 * The computed solutions (x and y) are then printed to standard output,
 * formatted to three decimal places.
 */

// Initialize a string variable to accumulate all data read from standard input.
// This variable will hold the complete input before processing.
let input = '';


// Ensure that the standard input stream remains open and active
// so that the program can continuously listen for incoming data.
process.stdin.resume();


// Set the character encoding for the standard input stream to 'utf8'.
// This is crucial for correctly interpreting multi-byte characters,
// although for numerical input, it primarily ensures consistent handling.
process.stdin.setEncoding( 'utf8' );


// Attach an event listener to the 'data' event of the standard input stream.
// This function will be executed every time a chunk of data is received.
process.stdin.on( 'data', function ( chunk ) {

  // Append the received data 'chunk' to the 'input' string.
  // This accumulates all incoming data until the stream ends.
  input += chunk;

} );


// Attach an event listener to the 'end' event of the standard input stream.
// This function is triggered once all data has been received and the
// input stream is closed. This marks the point for processing the accumulated data.
process.stdin.on( 'end', function ( ) {

  // Split the entire accumulated 'input' string into an array of strings,
  // using the newline character ('\n') as the delimiter.
  // Each element in the 'input' array will now represent a single line
  // from the original standard input.
  input = input.split( '\n' );

  // After all input has been parsed into lines, invoke the 'main' function
  // to begin the primary processing logic of the application.
  main( );

} );


/**
 * The 'main' function serves as the core logic of the application.
 * It iterates through each line of processed input, extracts numerical
 * values, performs specific calculations (solving a 2x2 linear system),
 * and then outputs the results.
 */
function main ( ) {

  // Iterate over each line of input stored in the 'input' array.
  // The loop runs from the first line (index 0) up to, but not including,
  // the total number of lines (input.length).
  for ( let i = 0; i < input.length; i++ ) {

    // For the current line, split it into an array of strings
    // using a space (' ') as the delimiter. This separates the
    // individual coefficients and constants.
    let input_line = input[ i ].split( ' ' );

    // Assign the extracted values from 'input_line' to individual
    // variables with descriptive names. These represent the coefficients
    // and constants of a 2x2 system of linear equations:
    // ax + by = c
    // dx + ey = f
    let a = input_line[ 0 ]; // Coefficient 'a' from the first equation.
    let b = input_line[ 1 ]; // Coefficient 'b' from the first equation.
    let c = input_line[ 2 ]; // Constant 'c' from the first equation.
    let d = input_line[ 3 ]; // Coefficient 'd' from the second equation.
    let e = input_line[ 4 ]; // Coefficient 'e' from the second equation.
    let f = input_line[ 5 ]; // Constant 'f' from the second equation.

    // Calculate the value of 'x' using a formula derived from Cramer's Rule
    // for solving a 2x2 system of linear equations.
    // The formula is: x = (bf - ec) / (db - ae)
    let x = ( ( b * f ) - ( e * c ) ) / ( ( d * b ) - ( a * e ) );

    // Calculate the value of 'y' using the first equation (ax + by = c),
    // after 'x' has been determined. Rearranging gives: y = (c - ax) / b
    let y = ( c - ( a * x ) ) / b;

    // Output the calculated values of 'x' and 'y' to the console.
    // Both values are formatted to three decimal places using toFixed(3).
    // They are separated by a space in the output.
    console.log( x.toFixed( 3 ), y.toFixed( 3 ) );

  } // End of the 'for' loop, which processes each line of input.

} // End of the 'main' function.