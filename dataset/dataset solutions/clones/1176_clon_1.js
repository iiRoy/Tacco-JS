/*
 * This JavaScript file processes input from standard input to perform
 * geometric calculations. It reads a line containing three space-separated numbers:
 * 'a', 'b', and an angle 'C' in degrees.
 *
 * The script then calculates:
 * 1. The area (S) of a triangle.
 * 2. The perimeter (L) of the triangle.
 * 3. The height (h) corresponding to side 'a'.
 *
 * All results are printed to the console, each on a new line.
 *
 * This is a Type I clone, preserving all identifiers and logic,
 * with extensive changes to whitespace and comments only.
 */


// Declare the 'readable' stream for standard input.
var   readable   =   process.stdin   ;


// Ensure the stream is in flowing mode to receive data.
readable . resume ( ) ;


// Set the encoding for the input stream to UTF-8.
readable . setEncoding (   'utf-8'   )   ;


// Register an event listener for when data chunks are available.
readable . on (   'data'   ,
                 function (   chunk   )   {

  // Append the received chunk to an 'input' string.
  // Note: 'input' is implicitly global or expected to be defined elsewhere.
  input   +=   chunk   ;


  // Parse the chunk: split by space, then convert each part to a Number.
  var   data   =   chunk . split (   " "   ) . map (   Number   )   ;


  // Extract the individual values from the parsed data array.
  var   a   =   data [ 0 ]   ;
  var   b   =   data [ 1 ]   ;
  // Convert the angle C from degrees to radians for trigonometric functions.
  var   C   =   data [ 2 ]   *   (   Math . PI   /   180   )   ;


  // --- Perform geometric calculations ---

  // Calculate the height 'h' of the triangle with respect to base 'a'.
  var   h   =   Math . sin (   C   )   *   b   ;
  // Calculate 'ta', the projection of side 'b' onto side 'a'.
  var   ta   =   Math . cos (   C   )   *   b   ;

  // Calculate the length of the third side 'c' using the Pythagorean theorem,
  // considering the height 'h' and the difference (a - ta).
  var   c   =   Math . sqrt (   Math . pow (   (   a   -   ta   )   ,   2   )   +   Math . pow (   h   ,   2   )   )   ;


  // Calculate the area 'S' of the triangle (base * height / 2).
  var   S   =   (   a   *   h   )   /   2   ;
  // Calculate the perimeter 'L' of the triangle (sum of all sides).
  var   L   =   a   +   b   +   c   ;


  // Output the calculated values to the console.
  // The format is: Area, newline, Perimeter, newline, Height.
  console . log (   S   +   '\n'   +   L   +   '\n'   +   h   )   ;

}   )   ;