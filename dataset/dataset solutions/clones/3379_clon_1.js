/* This file implements a solution for a specific problem.
   It uses strict mode for better code quality and error handling. */
"use strict" ;

/* Helper function to slice an array or iterable into a fixed number of elements.
   This is often used in transpiled code for destructuring assignments. */
function _slicedToArray ( arr , i )
{
  return _arrayWithHoles ( arr ) || _iterableToArrayLimit ( arr , i ) || _nonIterableRest ( ) ;
}

/* Helper function invoked when a non-iterable instance is attempted to be destructured.
   It throws a TypeError as this is an invalid operation. */
function _nonIterableRest ( )
{
  throw new TypeError ( "Invalid attempt to destructure non-iterable instance" ) ;
}

/* Helper function to convert an iterable (like a Set or Map) into an array
   up to a specified limit 'i'. */
function _iterableToArrayLimit ( arr , i )
{
  var _arr = [ ] ;
  var _n = true ;
  var _d = false ;
  var _e = undefined ;
  try
  {
    for ( var _i = arr [ Symbol . iterator ] ( ) , _s ; ! ( _n = ( _s = _i . next ( ) ) . done ) ; _n = true )
    {
      _arr . push ( _s . value ) ;
      if ( i && _arr . length === i ) break ; // If a limit 'i' is provided, stop at 'i' elements.
    }
  }
  catch ( err )
  {
    _d = true ;
    _e = err ;
  }
  finally
  {
    try
    {
      if ( ! _n && _i [ "return" ] != null ) _i [ "return" ] ( ) ;
    }
    finally
    {
      if ( _d ) throw _e ;
    }
  }
  return _arr ;
}

/* Helper function to check if an array has holes (is sparse).
   If it's a dense array, it returns the array itself. */
function _arrayWithHoles ( arr )
{
  if ( Array . isArray ( arr ) ) return arr ;
}


// Main function where the program logic resides.
function main ( input )
{
  var lines = input . split ( '\n' ) ; // Split the input string by newlines into an array of strings.

  // Parse the first line to get N.
  var _splitNum = splitNum ( lines [ 0 ] ) ,
      _splitNum2 = _slicedToArray ( _splitNum , 1 ) ,
      N = _splitNum2 [ 0 ] ; // N represents the number of elements.

  // Parse the remaining lines for the array 'as'.
  var as = splitNum ( input ) . slice ( 1 , N + 1 ) ; /* Get the numbers from the input.
                                                          The slice starts from index 1 to N+1
                                                          because the first line is N itself. */
  as . sort ( function ( a , b )
  {
    return a - b ; // Sort the array 'as' in ascending order.
  } ) ;

  var ds = [ ] ; // Initialize an empty array to store differences.

  // Calculate differences between adjacent elements.
  for ( var i = 0 ; i < N - 1 ; i ++ )
  {
    ds . push ( as [ i + 1 ] - as [ i ] ) ;
  }

  // Calculate the sum of differences.
  var sum = ds . reduce ( function ( a , b )
  {
    return a + b ; // Sum all elements in 'ds'.
  } , 0 ) ;
  // Determine the winner based on the parity of the sum.
  console . log ( sum % 2 === 0 ? 'first' : 'second' ) ;
}

// Read input from standard input and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

/* Utility function to split a string of numbers by whitespace
   and parse them into integers. */
function splitNum ( line )
{
  return line . split ( /\s+/ ) . map ( function ( n )
  {
    return parseInt ( n ) ; // Convert each string segment to an integer.
  } ) ;
}