/* This script processes geometric data from standard input to determine
 * if two line segments are perpendicular.
 * It reads line by line, parses coordinates, and applies a geometric check.
 */

// Core module for file system operations.
var   input =  require('fs') . readFileSync (  '/dev/stdin' ,  'utf8'  ) ; /* Reads input from stdin */

// The input string is trimmed of leading/trailing whitespace, then split into an array of lines.
var     Arr   =  (  input . trim (  )  ) . split ( "\n"  ) ;

// Iterate over each line (representing a set of coordinates) in the array.
Arr . forEach ( function ( v ) {

  // Parse the current line into an array of numbers.
  // Each line contains 8 numbers: xA, yA, xB, yB, xC, yC, xD, yD.
  var   nums   =   v . split ( " " ) . map ( Number ) ;

  // Initialize the answer for the current line to "NO".
  var   ans    =   "NO" ;


  // Calculate the vector components for the first segment (AB).
  var   x1     =   nums [ 2 ]   -   nums [ 0 ] ; // Delta X for AB
  var   y1     =   nums [ 3 ]   -   nums [ 1 ] ; // Delta Y for AB


  // Calculate the vector components for the second segment (CD).
  var   x2     =   nums [ 6 ]   -   nums [ 4 ] ; // Delta X for CD
  var   y2     =   nums [ 7 ]   -   nums [ 5 ] ; // Delta Y for CD


  // Calculate the slopes (k) for both segments.
  // Note: Division by zero needs to be handled for vertical lines.
  var   k1     =   ( nums [ 3 ]   -   nums [ 1 ] )   /   ( nums [ 2 ]   -   nums [ 0 ] ) ; // Slope of AB
  var   k2     =   ( nums [ 7 ]   -   nums [ 5 ] )   /   ( nums [ 6 ]   -   nums [ 4 ] ) ; // Slope of CD


  // Check for perpendicularity conditions.
  // Case 1: First segment is vertical (x1 == 0).
  if ( x1   ==   0 )
  {
    // If the first is vertical, the second must be horizontal (y2 == 0) for perpendicularity.
    if ( y2   ==   0 )
    {
      ans   =   "YES" ; // Perpendicular
    }
  }
  // Case 2: Second segment is vertical (x2 == 0).
  else if ( x2   ==   0 )
  {
    // If the second is vertical, the first must be horizontal (y1 == 0) for perpendicularity.
    if ( y1   ==   0 )
    {
      ans   =   "YES"   // Perpendicular
    }
  }
  // Case 3: Neither segment is vertical. Use the product of slopes (k1 * k2 = -1).
  // Using Math.abs(k1 * k2 + 1) < 1e-10 for floating point comparison.
  else if ( Math . abs ( k1   *   k2   +   1 )   <   1e-10 )
  {
    ans   =   "YES" ;   // Perpendicular
  }

  // Output the result for the current line.
  console . log ( ans ) ;
} ) ;