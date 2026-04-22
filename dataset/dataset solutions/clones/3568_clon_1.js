/*
 * This JavaScript file defines a function to perform a specific geometric calculation.
 * The primary function, `Main`, takes a string of coordinates as input
 * and computes new coordinates based on a set of transformation rules.
 *
 * This implementation includes an IIFE (Immediately Invoked Function Expression)
 * to handle input/output operations, adapting to whether it's run in a Node.js
 * environment (reading from standard input) or a browser-like environment
 * (simulating input and displaying results in HTML elements).
 */
function Main ( input ) {
  // Parse the input string: split by spaces and convert each part to an integer.
  // The `~~` operator is a concise way to convert a value to an integer (similar to Math.floor() for positive numbers).
  input = input . split ( " " ) . map ( a => ~~a ) ;

  // Extract the x-coordinate of the first point from the input array.
  var x1 = input . shift ( ) ;
  // Extract the y-coordinate of the first point.
  var y1 = input . shift ( ) ;

  // Extract the x-coordinate of the second point.
  var x2 = input . shift ( ) ;
  // Extract the y-coordinate of the second point.
  var y2 = input . shift ( ) ;


  // Calculate the x-coordinate of the third point.
  // This formula implies a rotation or a perpendicular vector operation relative to (x1, y1) and (x2, y2).
  var x3 = x2 - ( y2 - y1 ) ;
  // Calculate the y-coordinate of the third point.
  var y3 = y2 + ( x2 - x1 ) ;

  // Calculate the x-coordinate of the fourth point.
  // This step might complete a geometric shape, such as a parallelogram.
  var x4 = x3 - ( x2 - x1 ) ;
  // Calculate the y-coordinate of the fourth point.
  var y4 = y3 - ( y2 - y1 ) ;

  // Return the calculated coordinates (x3, y3, x4, y4) as a single space-separated string.
  return [ x3 , y3 , x4 , y4 ] . join ( " " ) ;
}

// This section handles the execution environment and provides input to the `Main` function.
// It's an Immediately Invoked Function Expression (IIFE) that takes three parameters (b, c, d).
( ( b , c , d ) =>
  // Check if `require` is defined, which typically indicates a Node.js environment.
  "undefined" != typeof require
    ? // If in Node.js:
      // Read input from standard input (/dev/stdin), execute Main with it, and print the result to console.
      console . log ( Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) )
    : // If not in Node.js (assumed to be a browser-like environment for testing):
      // This block simulates the input and displays the output using HTML elements.
      [
        // Process the initial string `b` by removing the first and last newlines.
        ( b = b . split ( "\n" ) . slice ( 1 , -1 ) . join ( "\n" ) ) ,
        // Execute the `Main` function with the processed input `b` and store the result in `c`.
        // Includes a try-catch block to handle potential errors during execution.
        ( c = function ( ) {
          try {
            return Main ( b ) ;
          } catch ( f ) {
            return f . stack || f . message ; // Return error stack or message if an exception occurs.
          }
        } ( ) ) ,
        // Determine the type of the result `c` and store it in `d`.
        ( d = typeof c ) ,
        // If `c` is not already a string, convert it to a JSON string representation.
        "string" == d || ( c = JSON . stringify ( c ) ) ,
        // Create an HTML form element and append child elements for display.
        $ ( "<form>" ) . append (
          // Map an array of data to create textarea or br elements.
          [
            [ 10 , b ] , // For input `b` (10 rows)
            0 ,         // A <br> tag
            [ 1 , d ] , // For type `d` (1 row)
            0 ,         // Another <br> tag
            [ 10 , c ]  // For result `c` (10 rows)
          ] . map ( f =>
            // Create either a `<textarea>` or `<br>` element based on `f`.
            $ (
              f ? "<textarea>" : "<br>" , // If `f` is truthy, create textarea; otherwise, create br.
              f && { rows : f [ 0 ] , cols : 40 , text : f [ 1 ] } // If textarea, set its rows, cols, and text content.
            )
          )
        ) . appendTo ( "body" ) // Append the created form to the HTML body.
      ]
) (
  // The initial string literal passed as `b` to the IIFE.
  // This serves as the default input for browser-based execution.
  `
31 -41 -59 26
`
) ;