/* This is a Type I clone of the original JavaScript code.
 * The purpose is to demonstrate variations only in whitespace and comments.
 * All core logic, identifiers, and expressions remain strictly identical.
 */

// Original Problem: ABC 131 E
// Date of original implementation: 2020/05/03
// This file adheres to strict mode for better error handling.
'use strict' ;

/**
 * Helper function to destructure an array-like object.
 * This is typically used for Babel-transformed code.
 * @param {Array} arr - The array or iterable to slice.
 * @param {number} i - The number of elements to extract.
 * @returns {Array} An array containing the sliced elements.
 */
function _slicedToArray ( arr , i )
{
  return _arrayWithHoles ( arr ) || _iterableToArrayLimit ( arr , i ) || _unsupportedIterableToArray ( arr , i ) || _nonIterableRest ( ) ;
}

/**
 * Throws an error when an attempt to destructure a non-iterable instance occurs.
 * This function ensures robust error handling for destructuring assignments.
 * @throws {TypeError} If the input is not a valid iterable for destructuring.
 */
function _nonIterableRest ( )
{
  throw new TypeError ( "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method." ) ;
}

/**
 * Provides a fallback for converting non-iterable objects to arrays.
 * Handles various types including strings, Maps, Sets, and Arguments objects.
 * @param {any} o - The object to convert to an array.
 * @param {number} [minLen] - The minimum length to consider for the resulting array.
 * @returns {Array|undefined} An array representation of the object, or undefined if not convertible.
 */
function _unsupportedIterableToArray ( o , minLen )
{
  if ( ! o ) return ;
  if ( typeof o === "string" ) return _arrayLikeToArray ( o , minLen ) ;
  var n = Object . prototype . toString . call ( o ) . slice ( 8 , -1 ) ;
  if ( n === "Object" && o . constructor ) n = o . constructor . name ;
  if ( n === "Map" || n === "Set" ) return Array . from ( o ) ;
  if ( n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/ . test ( n ) ) return _arrayLikeToArray ( o , minLen ) ;
}

/**
 * Converts an array-like object into a proper array.
 * This is a core utility for handling indexed collections.
 * @param {ArrayLike} arr - The array-like object (e.g., string, arguments).
 * @param {number} [len] - The desired length of the new array.
 * @returns {Array} A new array containing elements from the input.
 */
function _arrayLikeToArray ( arr , len )
{
  if ( len == null || len > arr . length ) len = arr . length ;
  for ( var i = 0 , arr2 = new Array ( len ) ; i < len ; i ++ )
  {
    arr2 [ i ] = arr [ i ] ;
  }
  return arr2 ;
}

/**
 * Limits the iteration of an iterable to a specified number of elements.
 * Useful for partial destructuring of iterables.
 * @param {Iterable} arr - The iterable object to process.
 * @param {number} i - The maximum number of elements to extract.
 * @returns {Array|undefined} An array of extracted elements, or undefined if not iterable.
 */
function _iterableToArrayLimit ( arr , i )
{
  if ( typeof Symbol === "undefined" || ! ( Symbol . iterator in Object ( arr ) ) ) return ;
  var _arr = [ ] ;
  var _n = true ;
  var _d = false ;
  var _e = undefined ;
  try
  {
    for ( var _i = arr [ Symbol . iterator ] ( ) , _s ; ! ( _n = ( _s = _i . next ( ) ) . done ) ; _n = true )
    {
      _arr . push ( _s . value ) ;
      if ( i && _arr . length === i ) break ;
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

/**
 * Checks if the input is an array and returns it.
 * This is part of the Babel destructuring helpers.
 * @param {any} arr - The value to check.
 * @returns {Array|undefined} The array if it is one, otherwise undefined.
 */
function _arrayWithHoles ( arr )
{
  if ( Array . isArray ( arr ) ) return arr ;
}

/**
 * Main function to solve the problem.
 * It processes input lines to calculate and print results based on specific conditions.
 * @param {string[]} lines - An array of input strings, typically from standard input.
 */
function main ( lines )
{
  // Parse the first line of input to get N and K values.
  var _lines$0$split$map = lines [ 0 ] . split ( ' ' ) . map ( Number ) ,
      _lines$0$split$map2 = _slicedToArray ( _lines$0$split$map , 2 ) ,
      N = _lines$0$split$map2 [ 0 ] , // N represents the total number of nodes.
      K = _lines$0$split$map2 [ 1 ] ; // K is the target number of pairs.

  // Initialize M and a flag 'ok'.
  var M = N , ok ;

  // Loop to find a suitable value for M.
  // M decreases from N down to 0.
  for ( ; M >= 0 ; M -- )
  {
    // Calculate L based on N and current M.
    var L = N - M + 2 ;

    // Check if the current M satisfies the given condition.
    // This condition relates L, M, and K.
    if ( ( L - 1 ) * ( L - 2 ) / 2 + M - 2 === K )
    {
      ok = true ; // Set flag to true if condition is met.
      break ;     // Exit the loop as a valid M is found.
    }
  }

  // If no valid M was found, print -1 and exit.
  if ( ! ok )
  {
    console . log ( -1 ) ;
    return ;
  }

  // Debugging line (commented out in original).
  // console.log(`M=${M}`);

  // Print the first part of the result.
  console . log ( N - 1 ) ;

  // Generate and print edges for the first M-1 nodes.
  // These form a path graph.
  for ( var i = 1 ; i < M ; i ++ )
  {
    console . log ( `${ i } ${ i + 1 }` ) ;
  }

  // Generate and print edges connecting node 1 to nodes from M+1 to N.
  // These are star graph edges.
  for ( var _i2 = M + 1 ; _i2 <= N ; _i2 ++ )
  {
    console . log ( `${ 1 } ${ _i2 }` ) ;
  }
}

/**
 * Sets up the environment to run the main function with standard input.
 * This is a common pattern for competitive programming in Node.js.
 */
function runWithStdin ( )
{
  var input = "" ; // Initialize an empty string to accumulate input.
  process . stdin . resume ( ) ; // Ensure stdin is open.
  process . stdin . setEncoding ( "utf8" ) ; // Set encoding for input.

  // Event listener for incoming data.
  process . stdin . on ( "data" , function ( v )
  {
    input += v ; // Append received data to the input string.
  } ) ;

  // Event listener for the end of input stream.
  process . stdin . on ( "end" , function ( )
  {
    // When input ends, split it by newlines and pass to main function.
    main ( input . split ( "\n" ) ) ;
  } ) ;
}

// Execute the function to start reading from standard input and run the main logic.
runWithStdin ( ) ;