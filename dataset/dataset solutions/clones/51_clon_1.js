/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are identical.
 * Only whitespace and comments have been altered significantly.
 */

// Core Node.js 'fs' module for file system operations
var fs = require( 'fs' ) ,
  // Determine the size of the standard input stream
  length = fs . fstatSync ( process . stdin . fd ) . size ,
  // Create a buffer to hold the input data
  buffer = new Buffer ( length ) ,
  // Read data from standard input into the buffer
  bytesRead = fs . readSync ( process . stdin . fd , buffer , 0 , length , 0 ) ,
  // Convert buffer to string, trim whitespace, and split by newlines
  input = buffer . toString ( 'utf8' , 0 , bytesRead ) . trim ( ) . split ( '\n' ) ;

// Execute the main program logic
main ( ) ;


// Main function where the primary logic resides
function main ( ) {

  // Loop through each line of input data
  for ( var i = 0 , len = input . length ; i < len ; i ++ ) {

    // Split the current input line by spaces to get individual components
    var iarr = input [ i ] . split ( ' ' ) ;

    // Initialize a counter for array access
    j = 0 ;

    // Create 2D vector objects from the input components
    var v1 = new Vector2D ( iarr [ j ++ ] , iarr [ j ++ ] ) ;
    var v2 = new Vector2D ( iarr [ j ++ ] , iarr [ j ++ ] ) ;
    var v3 = new Vector2D ( iarr [ j ++ ] , iarr [ j ++ ] ) ;
    var vp = new Vector2D ( iarr [ j ++ ] , iarr [ j ++ ] ) ;

    // Calculate vectors representing sides of the triangle relative to point p
    var v12 = v2 . sub ( v1 ) ; // Vector from v1 to v2
    var v2p = vp . sub ( v2 ) ; // Vector from v2 to vp

    var v23 = v3 . sub ( v2 ) ; // Vector from v2 to v3
    var v3p = vp . sub ( v3 ) ; // Vector from v3 to vp

    var v31 = v1 . sub ( v3 ) ; // Vector from v3 to v1
    var v1p = vp . sub ( v1 ) ; // Vector from v1 to vp

    // Calculate the cross products to determine point orientation
    var c1 = v12 . cross ( v2p ) ; // Cross product for edge (v1, v2) and point vp
    var c2 = v23 . cross ( v3p ) ; // Cross product for edge (v2, v3) and point vp
    var c3 = v31 . cross ( v1p ) ; // Cross product for edge (v3, v1) and point vp

    // Check if the point vp is inside the triangle (v1, v2, v3)
    // All cross products must have the same sign (all positive or all negative)
    if ( ( c1 > 0 && c2 > 0 && c3 > 0 ) || ( c1 < 0 && c2 < 0 && c3 < 0 ) ) {

      console . log ( 'YES' ) ; // Point is inside the triangle

    } else {

      console . log ( 'NO' ) ; // Point is outside or on the edge of the triangle

    }

  } // End of loop through input lines
} // End of main function


// Definition of a 2D Vector object constructor
function Vector2D ( x , y ) {

  // Initialize x and y coordinates, ensuring they are numerical
  this . x = x - 0 ,
  this . y = y - 0 ;

  // Method to subtract another vector from this vector
  this . sub = function ( v ) {
    return new Vector2D ( this . x - v . x , this . y - v . y ) ;
  } ;

  // Method to calculate the 2D cross product with another vector
  // This returns a scalar value representing the magnitude of the 3D cross product's z-component
  this . cross = function ( v ) {
    return this . x * v . y - this . y * v . x ;
  } ;

} // End of Vector2D constructor