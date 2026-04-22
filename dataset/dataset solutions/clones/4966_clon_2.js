/*
* This script processes numerical input to perform a specific calculation.
* It reads data from standard input, parses it, and then outputs a result.
*/

// Obtain the necessary Node.js core module for file system interactions.
const fileOperations = require ( "fs" ) ;

/*
* Read the entire content from standard input synchronously.
* The content is interpreted as UTF-8 text.
* Any surrounding whitespace (spaces, tabs, newlines, etc.) is removed.
* Finally, the clean content is segmented into an array of strings,
* where each element corresponds to a line separated by a newline character.
*/
const dataLines = fileOperations . readFileSync ( "/dev/stdin" , "UTF-8" )
                                   . replace ( /^[ \t\n\r\f\v]+|[ \t\n\r\f\v]+$/g , '' )
                                   . split ( "\n" ) ;

// Extract the first numerical component from the processed input.
// The unary plus operator converts the string representation to a numeric type.
const firstDimension = + dataLines [ 0 ] ;

// Extract the second numerical component from the processed input.
// This also uses the unary plus for type conversion.
const secondDimension = + dataLines [ 1 ] ;

// Extract the third numerical component, representing a height or altitude.
// Again, unary plus is used for explicit type coercion.
const heightValue = + dataLines [ 2 ] ;

// Perform the primary calculation: (firstDimension + secondDimension) * heightValue / 2.
// This formula is typically used to compute the area of a trapezoid or triangle.
// The computed result is then printed to the standard output console.
console . log ( ( firstDimension + secondDimension ) * heightValue / 2 ) ;