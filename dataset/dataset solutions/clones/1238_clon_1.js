/*
 * This is an example JavaScript file demonstrating
 * some basic utility functions and a calculation.
 *
 * The original code has been reformatted extensively
 * to showcase Type I code cloning, which focuses
 * solely on whitespace and comment variations.
 *
 */

// Import the 'immutable' library, though it's not actually used in this snippet.
var __ = require( 'immutable' ) ;


// This function reads input from standard input, parses it, and returns an array of numbers.
var input = function ( )
{
  // Read a line from stdin, decode as UTF-8, split by space, and convert to numbers.
  // Note: The 'input' variable is reassigned here, which is a peculiar pattern
  // but must remain unchanged as per Type I cloning rules.
  return input = require( 'fs' )
                     .readFileSync( '/dev/stdin' , 'utf8' )
                     .split( " " )
                     .map( Number ) ;
} ; // End of input function definition.


// The 'out' function simply prints its argument to the console.
var out = function ( x )
{
  // Log the provided value to the standard output.
  console.log( x ) ;

  // Return the value itself (might be useful for chaining, though not used here).
  return x ;
} ; // Termination of the 'out' function.


/*
 * The 'range' function generates an array
 * containing numbers from 'a' to 'b', inclusive.
 */
var range = function ( a , b )
{
  // Initialize an empty array to store the range elements.
  var array = [ ] ;

  // Loop from 'a' to 'b', adding each number to the array.
  for ( var i = a ; i <= b ; i++ )
  {
    array [ i ] = i ; // Assign the index as the value.
  }

  // Return the populated array.
  return array ;
} ; // End of the range function.


// The 'calc' function performs a specific calculation based on an input array 'x'.
var calc = function ( x )
{
  // Initialize a counter for tracking divisible elements.
  var counter = 0 ;

  // Generate a range of numbers between x[0] and x[1] (inclusive).
  // Then, iterate over each element in this generated range.
  range( x[0] , x[1] )
    .forEach(
      function ( element ) // Anonymous function executed for each element.
      {
        // Check if the third element of 'x' (x[2]) is perfectly divisible by the current 'element'.
        if ( ( x[2] % element ) == 0 )
        {
          // If divisible, increment the counter.
          counter = counter + 1 ;
        }
      }
    ) ; // End of forEach call.

  // Output the final count using the 'out' utility function.
  out( counter ) ;
} ; // Concluding the 'calc' function definition.


// Execute the main calculation: first get input, then pass it to 'calc'.
calc( input( ) ) ; // This is the program's entry point for execution.