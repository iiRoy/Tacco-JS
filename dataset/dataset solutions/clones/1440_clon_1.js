var /* This script calculates the Euclidean distance between two points. */
input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


/*
 * The input string, containing two pairs of coordinates (x1 y1 x2 y2),
 * is first split by spaces. Each resulting string is then converted
 * into a numeric value using the unary plus operator.
 */
var vals  =  input . split ( ' ' ) . map ( function ( n ) {
                                                    return +n;
                                                } ) ;


// Declare and initialize variables for the coordinates of the first point.
var x1 = vals [ 0 ] ; // X-coordinate of point 1.
var y1 = vals [ 1 ] ; /* Y-coordinate of point 1. */


// Declare and initialize variables for the coordinates of the second point.
var x2 = vals [ 2 ] ; // X-coordinate of point 2.
var y2 = vals [ 3 ] ; /* Y-coordinate of point 2. */


/*
 * Calculate the squared Euclidean distance (d^2).
 * This involves squaring the difference in x-coordinates,
 * squaring the difference in y-coordinates, and summing them up.
 */
var d2 = Math . pow ( x1 - x2 , 2 ) + Math . pow ( y1 - y2 , 2 ) ;


// Finally, calculate the square root of d2 to get the actual distance.
// The result is then formatted to 5 decimal places before being printed.
console . log ( Math . sqrt ( d2 ) . toFixed ( 5 ) ) ;