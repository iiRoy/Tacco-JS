"use strict" ;

// Helper function to safely decompose an array-like structure into a fixed number of elements.
function _decomposeArray ( collection , limitVal )
{
  return _testForArray ( collection ) || _iterateArrayWithBound ( collection , limitVal ) || _uniterableRemainder ( ) ;
}

// Throws an error if an attempt is made to destructure a non-iterable instance.
function _uniterableRemainder ( )
{
  throw new TypeError ( "Invalid attempt to destructure non-iterable instance" ) ;
}

// Iterates over an array-like object up to a specified limit.
function _iterateArrayWithBound ( collection , limitVal )
{
  var tempList = [ ] ;
  var notDone = true ;
  var encounteredError = false ;
  var errorObject = undefined ;

  try
  {
    for (
      var iteratorObj = collection [ Symbol . iterator ] ( ) , iteratorResult ;
      ! ( notDone = ( iteratorResult = iteratorObj . next ( ) ) . done ) ;
      notDone = true
    )
    {
      tempList . push ( iteratorResult . value ) ;

      if ( limitVal && tempList . length === limitVal )
      {
        break ;
      }
    }
  }
  catch ( caughtErr )
  {
    encounteredError = true ;
    errorObject = caughtErr ;
  }
  finally
  {
    try
    {
      if ( ! notDone && iteratorObj [ "return" ] != null )
      {
        iteratorObj [ "return" ] ( ) ;
      }
    }
    finally
    {
      if ( encounteredError )
      {
        throw errorObject ;
      }
    }
  }

  return tempList ;
}

// Checks if the given argument is an array.
function _testForArray ( collection )
{
  if ( Array . isArray ( collection ) )
  {
    return collection ;
  }
}

// Main program execution wrapped in an immediately invoked function expression (IIFE).
! function _procData ( )
{
  // Utility function to parse a string or array of strings into an array of integers.
  function parseNumbers ( textRow )
  {
    return ( Array . isArray ( textRow ) ? textRow : textRow . split ( /\s+/ ) ) . map ( function ( numStr )
    {
      return parseInt ( numStr ) ;
    } ) ;
  }

  // Another IIFE to handle the main logic with input processing.
  ! function _calcResult ( rawData )
  {
    // Split the raw input data into individual lines.
    var textLines = rawData . split ( "\n" ) ;

    // Parse the first line to extract two numerical values.
    var parsedValues = parseNumbers ( textLines [ 0 ] ) ,
        // Decompose the parsed array into two distinct variables.
        decomposedPair = _decomposeArray ( parsedValues , 2 ) ,
        firstValue = decomposedPair [ 0 ] ,
        secondValue = decomposedPair [ 1 ] ;

    // Apply conditional logic based on the first value.
    if ( firstValue <= 5 )
    {
      // If the first value is small, output zero.
      console . log ( 0 ) ;
    }
    else if ( firstValue <= 16 )
    {
      // If the first value is medium, output half of the second value.
      console . log ( secondValue / 2 ) ;
    }
    else
    {
      // Otherwise, output the second value directly.
      console . log ( secondValue ) ;
    }
  } ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Read input from standard input.
} ( ) ;