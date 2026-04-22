/*
 * This JavaScript module is designed to compute the Euclidean distance
 * between two points provided via standard input.
 * The input format expects a single line of space-separated numbers: x1 y1 x2 y2.
 * The calculated distance is then printed to standard output,
 * formatted to a specific number of decimal places.
 */


// First, we import the 'fs' (file system) module
// to enable reading from the standard input stream.
// The readFileSync method is used to synchronously read the content
// of '/dev/stdin' (which represents standard input on Unix-like systems).
// The content is interpreted as a UTF-8 encoded string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;


// Next, the raw input string is processed.
// 1. `.trim()`: Removes any leading or trailing whitespace.
// 2. `.split(" ")`: Divides the string into an array of substrings,
//    using a single space as the delimiter.
// 3. `.map(Number)`: Converts each string element in the resulting array
//    into its numerical representation.
// This array `a` will contain the four coordinate values: [x1, y1, x2, y2].
var a = input . trim ( ) . split ( " " ) . map ( Number ) ;


// Now, we calculate the Euclidean distance 'd' between the two points.
// The points are (a[0], a[1]) and (a[2], a[3]).
// The formula for Euclidean distance is:
// sqrt( (x2 - x1)^2 + (y2 - y1)^2 )
// Math.pow(base, exponent) is used for squaring.
// Math.sqrt() calculates the square root.
var d = Math . sqrt (
    Math . pow ( a [ 2 ] - a [ 0 ] , 2 )
    +
    Math . pow ( a [ 3 ] - a [ 1 ] , 2 )
) ;


// Finally, the calculated distance 'd' is printed to the console.
// `.toFixed(8)` formats the number to exactly 8 decimal places,
// returning a string representation.
console . log ( d . toFixed ( 8 ) ) ;