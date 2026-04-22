// This JavaScript program determines if a circle is entirely contained within a rectangle.
// It reads dimensions and coordinates from standard input.

// Initialize file system module for input operations.
const gInput = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Reads all data from stdin as a UTF-8 string.

// Process the raw input string.
const input = gInput . split ( ' ' ) . map ( s => parseInt ( s ) ) ; // Splits by space, then converts each part to an integer.

// Assign parsed values to respective variables for clarity.
var W = input [ 0 ] ; // Rectangle's width.
var H = input [ 1 ] ; // Rectangle's height.
var x = input [ 2 ] ; // Circle's center X-coordinate.
var y = input [ 3 ] ; // Circle's center Y-coordinate.
var r = input [ 4 ] ; // Circle's radius.

// Calculate the bounding box coordinates for the circle.
var minX = x - r ; // Leftmost X-coordinate of the circle.
var maxX = x + r ; // Rightmost X-coordinate of the circle.

var minY = y - r ; // Bottommost Y-coordinate of the circle.
var maxY = y + r ; // Topmost Y-coordinate of the circle.

// Perform the containment check.
// The rectangle is assumed to be defined by (0,0) as its bottom-left and (W,H) as its top-right.
const judge = 0 <= minX && maxX <= W && 0 <= minY && maxY <= H ;

// Output the result.
if ( judge )
  {
    console . log ( 'Yes' ) ; // The circle is fully inside the rectangle.
  }
else
  {
    console . log ( 'No' ) ;  // The circle is not fully inside the rectangle.
  }

// End of script.