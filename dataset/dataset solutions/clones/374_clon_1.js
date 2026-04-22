/*
 * This JavaScript file contains a function to rotate a 2D array
 * and then applies it multiple times to input data.
 *
 * This is a Type I clone, focusing on whitespace and comments.
 */

// Define the core transformation function named 'move'.
// It takes a 2D array 'yx' as input.
function  move ( yx )
{
  // Initialize an empty array to store the rotated result.
  var  arr = [ ] ;

  // First, create the rows for the new 2D array.
  // The dimensions are assumed to be 8x8 based on the loops.
  for ( var  y = 0 ;  y < 8 ;  y++ )
  {
    arr [ y ] = [ ] ; // Initialize each row as an empty array.
  }

  // Now, populate the new array with values from the input 'yx',
  // applying a specific rotation/transformation logic.
  for  ( var  y = 0 ;  y < 8 ;  y++ )
  {
    for  ( var  x = 0 ;  x < 8 ;  x++ )
    {
      // The transformation: arr[y][x] gets value from yx[7-x][y]
      // This effectively rotates the array 90 degrees clockwise.
      arr [ y ] [ x ]  =  yx [ 7 - x ] [ y ] ;
    }
  }

  // Return the newly transformed (rotated) array.
  return  arr ;
}


// --- Main program execution starts here ---

// Load input data from standard input.
// Ensure 'fs' module is available in the environment (e.g., Node.js).
var  input  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;

// Process the raw input string.
// 1. Trim any leading/trailing whitespace.
// 2. Split the string into an array of lines.
var  Arr  =  ( input . trim ( ) ) . split ( "\n" ) ;


// Initialize 'yx' as an empty array to hold the parsed 2D input.
var  yx  = [ ] ;

// Iterate through the first 8 lines of the input array.
// Each line represents a row in the 2D array.
for ( var  i = 0 ;  i < 8 ;  i++ )
{
  // Split each line into individual characters to form a row
  // and push it into the 'yx' array.
  yx . push ( Arr [ i ] . split ( "" ) ) ;
}

// --- Apply the 'move' transformation and print results ---

// First transformation: Rotate the initial 'yx' array.
yx  =  move ( yx ) ;

// Print the transformed array, joining rows with newline characters.
console . log ( yx . join ( "\n" ) ) ;


// Second transformation: Rotate the *already transformed* 'yx' array.
yx  =  move ( yx ) ;

// Print the second transformed array.
console . log ( yx . join ( "\n" ) ) ;


// Third transformation: Rotate the *twice transformed* 'yx' array.
yx  =  move ( yx ) ;

// Print the third transformed array.
console . log ( yx . join ( "\n" ) ) ;

// End of script.
/*
 * This code demonstrates array manipulation and I/O operations.
 * The 'move' function performs a 90-degree clockwise rotation on an 8x8 matrix.
 */