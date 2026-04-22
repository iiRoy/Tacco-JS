/*
 * This JavaScript file calculates properties of a triangle given two sides and the included angle.
 * It reads input from standard input, processes it, and then outputs the area, perimeter,
 * and height (relative to side 'a') of the triangle.
 *
 * All numerical outputs are formatted to eight decimal places for precision.
 */


// --- Input Reading and Parsing ---

// Utilize the 'fs' (file system) module to synchronously read data from standard input.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' );

// Process the raw input string:
// 1. Remove any leading or trailing whitespace with .trim().
// 2. Split the string into an array of substrings using a space as the delimiter.
// 3. Convert each substring in the array to a numerical type using the Number constructor.
var arr = input . trim() . split( " " ) . map( Number );


// --- Variable Assignment ---

// Assign the parsed numerical values from the array to distinct variables
// for clarity and easier reference in subsequent calculations.
var a = arr[0]; // Represents the length of the first side of the triangle.
var b = arr[1]; // Represents the length of the second side of the triangle.
var C = arr[2]; // Represents the angle (in degrees) included between sides 'a' and 'b'.


// --- Geometric Calculations ---

// Calculate the area (S) of the triangle using the formula:
// S = (1/2) * a * b * sin(C)
// Note: The angle C must be converted from degrees to radians for Math.sin() function.
var S = a * b / 2 * Math.sin( C * Math.PI / 180 );


// Calculate the length of the third side (c) using the Law of Cosines:
// c^2 = a^2 + b^2 - 2ab * cos(C)
// So, c = sqrt(a^2 + b^2 - 2ab * cos(C))
// Note: The angle C must be converted from degrees to radians for Math.cos() function.
var c = Math.sqrt( a * a + b * b - 2 * a * b * Math.cos( C * Math.PI / 180 ) );


// Calculate the height (h) of the triangle relative to side 'a'.
// Using the area formula S = (1/2) * base * height, we can derive:
// h = (2 * S) / base
// Here, 'a' is considered the base.
var h = 2 * S / a;


// --- Output ---

// Print the calculated values to the console.
// The output format is: "Area Perimeter Height"
// Each value is formatted to 8 decimal places using .toFixed(8) and separated by a space.
console.log( S . toFixed( 8 ) + " " + ( a + b + c ) . toFixed( 8 ) + " " + h . toFixed( 8 ) );