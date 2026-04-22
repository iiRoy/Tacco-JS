/*
 * This file defines a Vector class and related operations,
 * along with a main program to process coordinate data
 * from standard input.
 *
 * The primary goal of the 'cross' function is to determine
 * if a set of four points forms a convex quadrilateral,
 * which is a common geometric problem.
 */

// Define the Vector constructor function.
function Vector( x , y )
{
  // Initialize the x-coordinate of the vector instance.
  this.x = x ;
  // Initialize the y-coordinate of the vector instance.
  this.y = y ;
} // End of Vector constructor definition.


/**
 * Subtracts another vector from the current vector.
 * This operation creates a new vector representing the difference.
 *
 * @param {Vector} v - The vector to be subtracted from this vector.
 * @returns {Vector} A brand new Vector object, which is the result of the subtraction.
 */
Vector.prototype.sub = function( v )
{
  return new Vector( this.x - v.x ,
                     this.y - v.y ) ;
} ; // End of the 'sub' method definition.


/*
 * Calculates the 2D cross product between this vector and another vector 'v'.
 * In 2D, the cross product of two vectors (x1, y1) and (x2, y2) is a scalar
 * value defined as (x1 * y2 - y1 * x2). It represents the signed magnitude
 * of the area of the parallelogram formed by the two vectors.
 */
Vector.prototype.product = function (  v  )
{
  return this.x * v.y - this.y * v.x ;
} ; // End of the 'product' method definition.


// This is the main execution block of the script.
// It's wrapped in an Immediately Invoked Function Expression (IIFE)
// to encapsulate its variables and prevent global scope pollution.
( function ( input )
{
  // Remove any trailing newline character from the input string.
  // Then, split the input string into an array of lines.
  var p = input.replace( /\n$/, '' ).split( '\n' ) ;
  // Store the total number of lines (problem instances) to process.
  var n = p.length ;

  // Iterate through each line of the processed input.
  for ( var i = 0 ; i < n ; i++ )
  {
    // Take the first line from the array 'p', split it by comma,
    // and convert each resulting string part into a Number.
    var a = p.shift(  ) .split( ',' ) .map( Number ) ;

    // Call the 'cross' function with the elements of array 'a' as arguments.
    // The result is then printed to the console.
    console.log( cross.apply( null , a ) ) ;
  }
} ) ( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ) ; // The IIFE is immediately invoked with file system input.


/*
 * The 'cross' function determines if a quadrilateral formed by four given points
 * (A, B, C, D) is convex. It does this by checking the consistency of
 * the 'turning direction' implied by consecutive segments.
 *
 * Parameters:
 * xa, ya: Coordinates of the first point, A.
 * xb, yb: Coordinates of the second point, B.
 * xc, yc: Coordinates of the third point, C.
 * xd, yd: Coordinates of the fourth point, D.
 *
 * Returns: 'YES' if the quadrilateral is convex, 'NO' otherwise.
 */
function cross( xa , ya , xb , yb , xc , yc , xd , yd )
{
  // Create Vector objects for each of the four input points.
  var va = new Vector( xa , ya ) ;
  var vb = new Vector( xb , yb ) ;
  var vc = new Vector( xc , yc ) ;
  var vd = new Vector( xd , yd ) ;

  // Calculate vectors representing the segments of the quadrilateral.
  // vba = Vector from A to B
  var vba = vb.sub( va ) ;
  // vcb = Vector from B to C
  var vcb = vc.sub( vb ) ;
  // vdc = Vector from C to D
  var vdc = vd.sub( vc ) ;
  // vad = Vector from D to A
  var vad = va.sub( vd ) ;

  // Calculate the 2D cross product for consecutive pairs of segment vectors.
  // These cross products determine the 'turn' direction at each vertex.
  var c1 = vba.product( vcb ) ; // Turn at B (from AB to BC)
  var c2 = vcb.product( vdc ) ; // Turn at C (from BC to CD)
  var c3 = vdc.product( vad ) ; // Turn at D (from CD to DA)
  var c4 = vad.product( vba ) ; // Turn at A (from DA to AB)

  // A convex quadrilateral requires all turns to be in the same direction.
  // This means all cross products must have the same sign (all positive or all negative).
  if ( ( c1 > 0 && c2 > 0 && c3 > 0 && c4 > 0 ) ||
       ( c1 < 0 && c2 < 0 && c3 < 0 && c4 < 0 ) )
  {
    return 'YES' ; // All turns are consistent, so it's a convex shape.
  }
  // If the signs are not all the same, the quadrilateral is not convex.
  return 'NO' ;
} // End of the main 'cross' function.

/*
 * This is a simpler, helper function for calculating the 2D cross product
 * of two vectors (x1, y1) and (x2, y2), assuming they originate from the origin.
 * It's essentially the same logic as the Vector.prototype.product method,
 * but defined as a standalone function.
 *
 * Parameters:
 * x1, y1: Components of the first vector.
 * x2, y2: Components of the second vector.
 *
 * Returns: The scalar 2D cross product value.
 */
function cross_ ( x1 , y1 , x2 , y2 )
{
  return x1 * y2 - x2 * y1 ;
} // End of the helper 'cross_' function.