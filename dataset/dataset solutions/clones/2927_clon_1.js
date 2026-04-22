/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the Type I definition:
 * - All identifiers, variable names, function names, operators, and expressions are identical.
 * - Only whitespace and comments have been altered to create visual differences.
 */
"use strict"
; /* Enable strict mode for better error handling and cleaner code. */


// Helper function to slice an array or iterable into a fixed number of elements.
function _slicedToArray( arr , i )
{
  return _arrayWithHoles( arr )
  ||
  _iterableToArrayLimit( arr , i )
  ||
  _nonIterableRest( ) ;
}


// Helper function to throw an error if an iterable cannot be destructured.
function _nonIterableRest( )
{
  throw new TypeError(
    // Error message for invalid destructuring attempt.
    "Invalid attempt to destructure non-iterable instance"
  )
  ;
}


// Helper function to convert an iterable to an array with a limit.
function _iterableToArrayLimit( arr , i )
{
  var
    _arr = [ ]
    ; // Initialize an empty array to store elements.

  var
    _n = true
    ; // Flag to track if the iterator has more elements.

  var
    _d = false
    ; // Flag to track if an error occurred during iteration.

  var
    _e = undefined
    ; // Variable to store the error object.

  try
  {
    // Obtain the iterator for the array/iterable.
    for
    (
      var
        _i = arr [ Symbol.iterator ] ( ) ,
        _s
      ;
      ! ( _n = ( _s = _i.next( ) ).done )
      ; // Check if the iterator is done.
      _n = true
    )
    {
      _arr.push( _s.value )
      ; // Add the current value to the array.

      if
      (
        i
        &&
        _arr.length === i
      )
      {
        break
        ; // Stop if the limit 'i' is reached.
      }
    }
  }
  catch ( err )
  {
    _d = true
    ; // Mark that an error occurred.
    _e = err
    ; // Store the error.
  }
  finally
  {
    try
    {
      if
      (
        ! _n
        &&
        _i [ "return" ] != null
      )
      {
        _i [ "return" ] ( )
        ; // Call the return method of the iterator if available.
      }
    }
    finally
    {
      if
      (
        _d
      )
      {
        throw _e
        ; // Re-throw the original error if one occurred.
      }
    }
  }

  return _arr
  ; // Return the processed array.
}


// Helper function to check if a value is an array.
function _arrayWithHoles( arr )
{
  if
  (
    Array.isArray( arr )
  )
  {
    return arr
    ; // If it's already an array, return it as is.
  }
}


// Self-executing anonymous function to encapsulate the main logic.
! function ( )
{

  // Function to parse a line of numbers.
  function splitNum( line )
  {
    // If 'line' is already an array, use it; otherwise, split by whitespace.
    return ( Array.isArray( line ) ? line : line.split( /\s+/ ) )
    .map(
      function ( n )
      {
        return parseInt( n )
        ; // Convert each part to an integer.
      }
    )
    ;
  }


  // Another self-executing anonymous function for the primary application logic.
  ! function ( input )
  {
    var
      lines = input.split( "\n" )
      ; // Split the input string into an array of lines.

    // Destructure the first line into two variables A and B.
    var
      _splitNum = splitNum( lines [ 0 ] ) ,
      _splitNum2 = _slicedToArray( _splitNum , 2 ) ,
      A = _splitNum2 [ 0 ] , // First number.
      B = _splitNum2 [ 1 ]
      ; // Second number.

    // Conditional logic based on the value of A.
    if
    (
      A <= 5
    )
    {
      console.log( 0 )
      ; // If A is 5 or less, output 0.
    }
    else if
    (
      A <= 12
    )
    {
      console.log( B / 2 )
      ; // If A is between 6 and 12 (inclusive), output B divided by 2.
    }
    else
    {
      console.log( B )
      ; // If A is greater than 12, output B.
    }
  }
  // Read input from standard input using Node.js 'fs' module.
  (
    require( "fs" ).readFileSync( "/dev/stdin" , "utf8" )
  )
  ;
}
( )
;