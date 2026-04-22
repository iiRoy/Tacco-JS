// This is a Type I clone of the original JavaScript code.
// Extensive changes to whitespace and comments have been made
// to make it visually distinct while preserving logical equivalence.

/**
 *  A simple class definition for representing a point in a 2D coordinate system.
 *  It stores integer coordinates x and y.
 */
class Point
{


 constructor ( x , y )
 { // The constructor function for initializing a Point object.
  this . x = x ; // Assign the provided x value to the object's x property.
  this . y = y ; // Assign the provided y value to the object's y property.
 } ; // Note the semicolon after the constructor body, as in the original.
} ; // Semicolon after class definition, as in the original.


// This function compares two points, p1 and p2, based on a cross product calculation.
// It seems to be part of a geometric algorithm, possibly for convex hull or sorting.
// A crucial observation: 'p0' is used within this function but is not defined
// in its scope or passed as an argument. This exact behavior is replicated.
function compare ( p1 , p2 )
{
 // Calculate a 'cross product' like value. The specific 'p0' variable
 // suggests it might be a global reference point or a missing parameter.
 var cross_prod = ( p1 . y * p0 . y - p2 . x * p1 . x ) - ( p1 . x * p0 . x - p2 . y * p1 . y ) ;


 if ( cross_prod == 0 )
 { // If the cross product is zero, the points are collinear with 'p0'.
  // In this case, comparison falls back to y-coordinates.
  return p1 . y <= p2 . y ? -1 : 1 ;
 }

 // If not collinear, comparison is based on the sign of the cross product.
 return cross_prod > 0 ? -1 : 1 ;
} ; // End of the compare function.


/*
 * This utility function performs a swap operation within an array.
 * It exchanges the element at the first position (index 0) with
 * the element at the specified 'min_idx'. The array is modified in place.
 */
function swap ( arr , min_idx )
{
 var temp = arr [ 0 ] ; // Temporarily store the element at the first index.
 arr [ 0 ] = arr [ min_idx ] ; // Move the element from 'min_idx' to the first position.
 arr [ min_idx ] = temp ; // Place the temporarily stored element at 'min_idx'.

 return arr ; // Return the modified array.
} // End of swap function definition.


// This function identifies the "bottom-most" point in an array of points.
// The "bottom-most" point is defined as the point with the minimum y-coordinate.
// If multiple points share the minimum y-coordinate, the one with the minimum x-coordinate is chosen.
// After identification, this point is moved to the first position of the array using the 'swap' function.
function find_bot ( arr , size )
{
 // Initialize 'min' with the y-coordinate of the first point
 // and 'min_idx' with its index.
 var min = arr [ 0 ] . y ;
 var min_idx = 0 ;

 // Iterate through the array to find the point meeting the criteria.
 for ( var i = 0 ; i < size ; i ++ )
 {
  // Check for a new minimum:
  // 1. If current point's y is less than the current minimum y.
  // 2. If current point's y is equal to minimum y, but its x is less than current minimum x.
  if ( arr [ i ] . y < min || ( arr [ i ] . y == min && arr [ i ] . x < arr [ min_idx ] . x ) )
  {
   min_idx = i ; // Update the index of the minimum point.
   min = arr [ i ] . y ; // Update the minimum y-coordinate.
  } ; // Semicolon after if block, as in the original.
 } ; // Semicolon after for loop, as in the original.

 // After the loop, 'min_idx' holds the index of the bottom-most point.
 // This point is then swapped with the first element of the array.
 // Note: 'vec' is used here, which is not defined in this function's scope.
 // This is a direct replication of the original code's potential issue.
 swap ( vec , min_idx ) ;

 // The original code had a commented-out return statement, which is preserved.
 //return arr;
} ; // End of find_bot function.


// Start of the main script execution.
// This section handles reading input, parsing it, and preparing data.

var file = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read the entire content of stdin.
var input = file . split ( "\n" ) ; // Split the file content into an array of lines.

var size = parseInt ( input [ 0 ] ) ; // The first line is parsed as the total number of points.
var points = [ ] ; // An empty array initialized to store the Point objects.

// Loop from the second line (index 1) up to 'size' to parse point coordinates.
for ( var i = 1 ; i < size + 1 ; i ++ )
{
 point = input [ i ] . split ( " " ) ; // Each line is split by space to get x and y strings.
 x = parseInt ( point [ 0 ] ) ; // Parse the first part as the x-coordinate.
 y = parseInt ( point [ 1 ] ) ; // Parse the second part as the y-coordinate.
 // Create a new Point object and add it to the 'points' array.
 // Note: The original code calls Point(x, y) without 'new'. This exact expression is preserved.
 points . push ( Point ( x , y ) ) ;
}

// The following code block was commented out in the original source.
// It is preserved here as comments to maintain the exact structure of the original.
// // Call the find_bot function with the collected points and their count.
// find_bot(points, size);
// // Attempt to parse the first point object into an integer. This is likely an error
// // in the original logic, as points[0] is a Point object, not a string or number.
// base_p = parseInt(points[0]);
// // This block attempts to sort the points array, but is commented out.
// sorted_arr = base_p.concat(points.subarray(1).sort(function (p1, p2) {
//     var cross_prod = (p1.y * base_p.y - p2.x * p1.x) - (p1.x * base_p.x - p2.y * p1.y);
//     if (cross_prod == 0) {
//         return p1.y <= p2.y ? -1 : 1;
//     }
//     return cross_prod > 0 ? -1 : 1;
// }));


// Finally, print the array of Point objects to the console.
console . log ( points ) ;