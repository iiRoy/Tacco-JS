/*
 * This JavaScript program calculates the area, perimeter, and height
 * of a triangle given two sides and the angle between them.
 *
 * The input is read from standard input (`/dev/stdin`) and is expected
 * to be three space-separated numbers: side 'a', side 'b', and angle 'C' in degrees.
 *
 * Output:
 *  - Area of the triangle (S)
 *  - Perimeter of the triangle (L)
 *  - Height of the triangle (h)
 * Each output value is printed on a new line.
 */

// Define the primary function that encapsulates all program logic.
function Main(  )
{
    // Obtain the Node.js 'fs' (file system) module for input/output operations.
    var  fs  =  require( 'fs' );

    // Specify the path to the input file. For competitive programming, this is often '/dev/stdin'.
    var  fileName  =  '/dev/stdin';


    // Read the entire content of the input file synchronously.
    // The content is then converted from a Buffer object to a UTF-8 string.
    var  input  =  fs.readFileSync( fileName ) .  toString(  );

    // Process the input string:
    // 1. Split the string by spaces into an array of string-numbers.
    // 2. Map each string element to its numerical equivalent using the global Number constructor.
    var  data  =  input .  split( " " ) .  map( Number );

    // Assign the extracted numerical values to respective variables.
    var  a  =  data[0];  // Length of side 'a'.
    var  b  =  data[1];  // Length of side 'b'.
    // Convert the angle 'C' from degrees to radians, as Math.sin/cos expect radians.
    var  C  =  data[2]  *  (  Math.PI  /  180  );


    // Perform trigonometric calculations to find triangle properties.
    // Calculate the height 'h' corresponding to side 'a'.
    var  h  =  Math.sin( C )  *  b;

    // Calculate the length of the projection of side 'b' onto side 'a'.
    var  ta  =  Math.cos( C )  *  b;

    // Calculate the length of the third side 'c' using the Law of Cosines,
    // which can be derived from the Pythagorean theorem with 'h' and 'ta'.
    var  c  =  Math.sqrt(  Math.pow(  (  a  -  ta  )  ,  2  )  +  Math.pow(  h  ,  2  )  );


    // Calculate the area (S) of the triangle.
    var  S  =  (  a  *  h  )  /  2;

    // Calculate the perimeter (L) of the triangle.
    var  L  =  a  +  b  +  c;


    // Output the computed results to the console.
    // Each value is concatenated with a newline character to ensure separate lines.
    console.log(  S  +  '\n'  +  L  +  '\n'  +  h  );
}
; // End of Main function definition.

// Execute the Main function to begin the program's operation.
Main(  ) ; // This line is the entry point for the script.