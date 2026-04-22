/*
 * This JavaScript code calculates the area of a triangle using Heron's formula
 * and then determines if a given point lies within that triangle.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Function to calculate the area of a triangle given its three side lengths (a, b, c)
function heron ( a , b , c ) {
    // Calculate the semi-perimeter 's'
    var s = ( a + b + c ) / 2 ;

    // Apply Heron's formula: Area = sqrt(s * (s - a) * (s - b) * (s - c))
    var S = Math . sqrt ( s * ( s - a ) * ( s - b ) * ( s - c ) ) ;

    // Return the calculated area
    return S ;
}


// Read input from standard input, typically /dev/stdin
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input:
// 1. Trim any leading/trailing whitespace from the entire input string.
// 2. Split the input string into an array of lines based on the newline character.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Iterate through each line of the input array
for ( var I = 0 ; I < Arr . length ; I ++ ) {

    // For each line, split it by spaces and convert each part to a Number.
    // This creates an array of numbers representing coordinates.
    var arr = Arr [ I ] . split ( " " ) . map ( Number ) ;

    // Extract coordinates for the three vertices of the main triangle (x1, y1), (x2, y2), (x3, y3)
    var x1 = arr [ 0 ] ; var y1 = arr [ 1 ] ;

    var x2 = arr [ 2 ] ; var y2 = arr [ 3 ] ;

    var x3 = arr [ 4 ] ; var y3 = arr [ 5 ] ;

    // Extract coordinates for the test point (xp, yp)
    var xp = arr [ 6 ] ; var yp = arr [ 7 ] ;


    // Calculate the distance between vertex 1 and vertex 2
    var d12 = Math . sqrt ( Math . pow ( x1 - x2 , 2 ) + Math . pow ( y1 - y2 , 2 ) ) ;

    // Calculate the distance between vertex 1 and vertex 3
    var d13 = Math . sqrt ( Math . pow ( x1 - x3 , 2 ) + Math . pow ( y1 - y3 , 2 ) ) ;

    // Calculate the distance between vertex 2 and vertex 3
    var d23 = Math . sqrt ( Math . pow ( x2 - x3 , 2 ) + Math . pow ( y2 - y3 , 2 ) ) ;


    // Calculate the distance between the test point and vertex 1
    var dp1 = Math . sqrt ( Math . pow ( xp - x1 , 2 ) + Math . pow ( yp - y1 , 2 ) ) ;

    // Calculate the distance between the test point and vertex 2
    var dp2 = Math . sqrt ( Math . pow ( xp - x2 , 2 ) + Math . pow ( yp - y2 , 2 ) ) ;

    // Calculate the distance between the test point and vertex 3
    var dp3 = Math . sqrt ( Math . pow ( xp - x3 , 2 ) + Math . pow ( yp - y3 , 2 ) ) ;


    // Calculate the area of the main triangle (T123) using the heron function
    var S123 = heron ( d12 , d13 , d23 ) ;

    // Calculate the sum of the areas of three smaller triangles formed by the test point
    // T12P (sides d12, dp1, dp2) + T13P (sides d13, dp1, dp3) + T23P (sides d23, dp2, dp3)
    var s123 = heron ( d12 , dp1 , dp2 ) + heron ( d13 , dp1 , dp3 ) + heron ( d23 , dp2 , dp3 ) ;


    // Compare the total area of the main triangle with the sum of the areas of the sub-triangles.
    // If the test point is inside the main triangle, the areas should be approximately equal.
    // A small epsilon (0.0005) is used for floating-point comparison.
    // If they are approximately equal, output "YES", otherwise "NO".
    console . log ( ( Math . abs ( S123 - s123 ) < 0.0005 ) ? "YES" : "NO" ) ;
}
// End of processing loop.