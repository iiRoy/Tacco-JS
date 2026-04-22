/*
 * This is a JavaScript program demonstrating concise
 * input processing and mathematical calculations.
 * It reads lines from standard input, parses them,
 * and updates coordinates based on trigonometric functions.
 */

// Define constant-like string fragments for dynamic code generation.
// 'm' is a partial string for mathematical operations.
m   =   '+=+j[0]*Math.' ;
// 'n' represents the angle conversion to radians.
n   =   '(s*Math.PI/180)' ;

// Initialize coordinate variables (x, y) and an angle accumulator (s) to zero.
x   =   y   =   s   =   0 ; // All initialized to 0.

// The main processing pipeline starts here.
// It uses Node.js 'fs' module to read from standard input.
require ( "fs" )
    .   readFileSync ( "/dev/stdin" ,   "utf8" ) // Read file synchronously, specify UTF-8 encoding.
    .   trim ( )                                 // Remove any leading or trailing whitespace from the input.
    .   split ( '\n' )                           // Split the entire input string into an array of lines.
    .   some (
        // The 'some' method iterates over each line.
        // It stops if the callback returns a truthy value, otherwise continues.
        // In this case, no explicit return, so it processes all lines.
        function ( i )                          // 'i' represents the current line string.
        {
            // Parse the current line: split by comma to get two parts.
            // 'j[0]' is assumed to be a magnitude, 'j[1]' an angle increment.
            j   =   i . split ( ',' ) ;

            // Dynamically construct and execute code using 'eval'.
            // This updates 'x' and 'y' based on the magnitude (j[0])
            // and the accumulated angle 's'.
            // The 'm' and 'n' strings are crucial here.
            eval ( 'x'   +   m   +   'sin'   +   n   +   ','   +   'y'   +   m   +   'cos'   +   n ) ;

            // Accumulate the angle from the second part of the current line.
            // The unary '+' converts 'j[1]' to a number before adding.
            s   +=   +j[1] ;

            // The 'some' callback implicitly returns 'undefined' (falsy),
            // ensuring all lines are processed.
        }
    ) ; // End of the 'some' method call.

// Output the final calculated integer coordinates.
// The '~~' operator performs a double bitwise NOT,
// effectively truncating the float to an integer.
console . log ( ~~x )
, // A comma here allows chaining console.log calls, though a semicolon is more common.
console . log ( ~~y )
; // Final semicolon for the entire statement.