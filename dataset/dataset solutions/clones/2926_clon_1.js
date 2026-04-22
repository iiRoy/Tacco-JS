/* This file contains helper functions for array destructuring and a main logic block. */
"use strict" ; // Enforces strict mode for cleaner code.


function _slicedToArray ( arr , i )
{
  // Helper function to convert an array-like object into an array with a specific limit.
  return  _arrayWithHoles ( arr )  ||  _iterableToArrayLimit ( arr , i )  ||  _nonIterableRest () ;
}


function _nonIterableRest ()
{
  // Throws an error if an attempt is made to destructure a non-iterable instance.
  throw  new  TypeError ( "Invalid attempt to destructure non-iterable instance" ) ;
}


function _iterableToArrayLimit ( arr , i )
{
  var   _arr  =  [ ] ; // Initialize an empty array to store elements.
  var   _n    =  true ;  /* Flag to indicate if iteration is still ongoing. */
  var   _d    =  false ; // Flag for 'done' status.
  var   _e    =  undefined ; // Stores any error encountered during iteration.

  try
  {
    // Iterate over the input array or iterable.
    for  ( var  _i  =  arr [ Symbol.iterator ] () ,  _s ;  ! ( _n  =  ( _s  =  _i.next () ) . done ) ;  _n  =  true )
    {
      _arr.push ( _s.value ) ; // Add the current value to the result array.

      if  ( i  &&  _arr.length  ===  i )
      {
        break ; // Stop if the desired limit 'i' is reached.
      }
    }
  }
  catch ( err )
  {
    _d  =  true ; // Mark as done due to error.
    _e  =  err ;  // Store the error.
  }
  finally
  {
    try
    {
      // Ensure the iterator is properly closed if it has a 'return' method.
      if  ( ! _n  &&  _i [ "return" ]  !=  null )
      {
        _i [ "return" ] () ;
      }
    }
    finally
    {
      if  ( _d )
      {
        throw  _e ; // Re-throw any error encountered.
      }
    }
  }

  return  _arr ; // Return the limited array.
}


function _arrayWithHoles ( arr )
{
  // Checks if the input is a true array.
  if  ( Array.isArray ( arr ) )
  {
    return  arr ; // If it is, return it directly.
  }
}


/* Main immediately invoked function expression (IIFE) to encapsulate application logic. */
! function ()
{

  /**
   * Parses a line of numbers, converting them into an array of integers.
   * Accepts either a string (which it splits by whitespace) or an array.
   * @param {string|Array<string>} line - The input line or array of number strings.
   * @returns {Array<number>} An array of parsed integers.
   */
  function  splitNum ( line )
  {
    return  ( Array.isArray ( line )  ?  line  :  line.split ( /\s+/ ) ) . map ( function ( n )
    {
      return  parseInt ( n ) ; // Convert each string part to an integer.
    } ) ;
  }


  // Another IIFE that processes input from stdin.
  ! function ( input )
  {
    var  lines  =  input.split ( "\n" ) ; // Split the entire input into individual lines.

    // Destructure the first line into two variables A and B using helper functions.
    var  _splitNum     =  splitNum ( lines [ 0 ] ) ,
         _splitNum2    =  _slicedToArray ( _splitNum , 2 ) ,
         A             =  _splitNum2 [ 0 ] ,
         B             =  _splitNum2 [ 1 ] ;

    // Conditional logic based on the value of A.
    if  ( A  <=  5 )
    {
      console.log ( 0 ) ; // Output 0 if A is 5 or less.
    }
    else  if  ( A  <=  16 )
    {
      console.log ( B  /  2 ) ; // Output B divided by 2 if A is between 6 and 16 (inclusive).
    }
    else
    {
      console.log ( B ) ; // Output B if A is greater than 16.
    }

  } ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Read input synchronously from standard input.

} () ;