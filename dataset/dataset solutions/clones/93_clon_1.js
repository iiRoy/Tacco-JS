/*
 * This JavaScript program processes a series of geometric problems.
 * It reads input from standard input, performs calculations related to
 * the relative positions of circles, and outputs results.
 *
 * This specific implementation calculates the intersection status
 * of two circles based on their center coordinates and radii.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// We first import the 'fs' (file system) module
// which is required to read input from the standard input stream.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;


// The input string is then processed:
// 1. trim() removes any leading or trailing whitespace.
// 2. split("\n") breaks the string into an array of lines.
var   Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// The first line of the input contains the number of test cases, 'n'.
// We use Arr.shift() to extract this first element and remove it from the array.
// Subtracting 0 is a common idiom to ensure the value is treated as a number.
var n = Arr . shift ( ) - 0 ;


// Now, we iterate 'n' times, once for each test case provided in the input.
for ( var i = 0 ; i < n ; i ++ )
{

   // For each line (test case) in the remaining 'Arr':
   // 1. split(" ") breaks the line into an array of strings based on spaces.
   // 2. map(Number) converts each string element in this new array to a number.
   var arr = Arr [ i ] . split ( " " ) . map ( Number ) ;


   // An Immediately Invoked Function Expression (IIFE) is used here.
   // This function takes six arguments representing the coordinates (xa, ya, xb, yb)
   // and radii (ra, rb) of two circles.
   ( function ( xa , ya , ra , xb , yb , rb )
   {
      // 'ans' will store the integer result indicating the relationship between the circles.
      var ans ;

      // Calculate the Euclidean distance 'd' between the centers of the two circles.
      // This uses the Pythagorean theorem: sqrt((x2-x1)^2 + (y2-y1)^2).
      var d = Math . sqrt ( Math . pow ( xa - xb , 2 ) + Math . pow ( ya - yb , 2 ) ) ;


      // Condition 1: Circles are completely separate and do not touch.
      // The distance between centers is greater than the sum of their radii.
      if ( d > ra + rb )
         ans = 0 ; // No intersection.


      // Condition 2: Circles touch or overlap in some way.
      // The distance between centers is less than or equal to the sum of their radii.
      if ( d <= ra + rb )
      {
         ans = 1 ; // Default: They intersect or touch externally.

         // Sub-condition 2a: One circle is completely inside the other (ra contains rb).
         // The distance between centers is less than or equal to the difference of their radii (ra - rb).
         // This implies circle 'ra' is larger and encompasses 'rb'.
         if ( d <= ra - rb )
            ans = 2 ; // Circle 'ra' contains 'rb'.

         // Sub-condition 2b: One circle is completely inside the other (rb contains ra).
         // Similar to 2a, but 'rb' is the larger circle encompassing 'ra'.
         if ( d <= rb - ra )
            ans = -2 ; // Circle 'rb' contains 'ra'.
      }

      // Finally, print the calculated answer for the current test case to the console.
      console . log ( ans ) ;

   } ) . apply ( null , arr ) ; // The 'arr' array elements are passed as arguments to the IIFE.

} // End of the loop iterating through test cases.