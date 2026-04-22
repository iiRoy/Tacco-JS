/* This is a Type I clone of the original JavaScript code.
   The purpose is to demonstrate variations in whitespace and comments
   while maintaining absolute structural and logical equivalence. */

// Problem: ABC 131 E - A programming contest problem identifier.
// Date of original code generation or contest: 2020/05/03 - A timestamp reference.

'use strict' ; /* Enforces strict mode parsing and error handling in JavaScript.
                  This ensures cleaner code and prevents certain "bad parts" of JavaScript. */

// --- Start of transpiled helper functions ---

/**
 * Helper function to destructure an array-like object into a fixed-size array.
 * @param {Array} arr - The array or iterable to slice.
 * @param {number} i - The number of elements to extract.
 * @returns {Array} A new array containing the first 'i' elements.
 */
function _slicedToArray ( arr , i )
{
  return _arrayWithHoles ( arr )
         || _iterableToArrayLimit ( arr , i )
         || _unsupportedIterableToArray ( arr , i )
         || _nonIterableRest ( ) ;
}

/**
 * Throws a TypeError if an attempt is made to destructure a non-iterable instance
 * when an iterable was expected.
 */
function _nonIterableRest ( )
{
  throw new TypeError ( "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method." ) ;
}

/**
 * Converts various types of objects into a real array, handling different scenarios.
 * This is a robust array-like object to array conversion utility.
 * @param {any} o - The object to convert.
 * @param {number} minLen - Minimum length for the array.
 * @returns {Array|undefined} An array representation of 'o', or undefined if 'o' is null/undefined.
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
 * Creates a new array from an array-like object, ensuring it has a specific length.
 * @param {Array|string} arr - The source array or string.
 * @param {number} len - The desired length of the new array.
 * @returns {Array} A new array with elements copied from 'arr'.
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
 * Limits the number of items iterated from an iterable to a specified count.
 * This function handles various iterable types and ensures proper cleanup.
 * @param {Iterable} arr - The iterable object to process.
 * @param {number} i - The maximum number of elements to extract.
 * @returns {Array} An array containing up to 'i' elements from the iterable.
 */
function _iterableToArrayLimit ( arr , i )
{
  if ( typeof Symbol === "undefined" || ! ( Symbol . iterator in Object ( arr ) ) ) return ;

  var _arr = [ ] ;
  var _n   = true ;
  var _d   = false ;
  var _e   = undefined ;

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
 * Checks if the given argument is an array. If it is, it returns the array.
 * Otherwise, it returns undefined. This is a simple check used in destructuring.
 * @param {any} arr - The value to check.
 * @returns {Array|undefined} The array if `arr` is an array, otherwise `undefined`.
 */
function _arrayWithHoles ( arr )
{
  if ( Array . isArray ( arr ) ) return arr ;
}

// --- End of transpiled helper functions ---


/**
 * The main logic function that processes input lines and produces output.
 * @param {string[]} lines - An array of strings, where each string is a line of input.
 */
function main ( lines )
{
  // Destructure the first line of input to get N and K.
  // The line is split by space, and each part is converted to a Number.
  var _lines$0$split$map = lines [ 0 ] . split ( ' ' ) . map ( Number ) ,

      _lines$0$split$map2  = _slicedToArray ( _lines$0$split$map , 2 ) ,

      N = _lines$0$split$map2 [ 0 ] , // N represents the total number of vertices.
      K = _lines$0$split$map2 [ 1 ] ; // K represents the target number of pairs (edges).

  var M , ok ; // Initialize M (a variable to iterate for a specific value) and a boolean flag 'ok'.

  // Loop to find a suitable value for M.
  // M starts from N and decrements down to 1.
  for ( M = N ; M >= 1 ; M -- )
  {
    var L = N - M + 1 ; // Calculate L based on N and current M.

    // Check if the current M satisfies the condition for K.
    // This formula relates M, L, and K to the problem's constraints.
    if ( ( L - 1 ) * ( L - 2 ) / 2 + M - 1 === K )
    {
      ok = true ; // If a valid M is found, set 'ok' to true.
      break ;     // Exit the loop as we found our M.
    }
  }

  // If no suitable M was found after checking all possibilities, output -1.
  if ( ! ok )
  {
    console . log ( -1 ) ;
    return ; // Terminate the function early.
  }

  // If a valid M was found, proceed to print the results.
  // First, print the determined value of M.
  console . log ( `M=${M}` ) ;

  // Next, print N-1, which represents a count related to the graph structure.
  console . log ( N - 1 ) ;

  // Generate and print edges for the first part of the graph (a path or line).
  // These edges connect consecutive vertices from 1 to M.
  for ( var i = 1 ; i <= M ; i ++ )
  {
    console . log ( `${i} ${i + 1}` ) ;
  }

  // Generate and print edges for the second part of the graph (a star-like structure).
  // These edges connect vertex (M+1) to all vertices from (M+2) up to N.
  for ( var _i2 = M + 2 ; _i2 <= N ; _i2 ++ )
  {
    console . log ( `${M + 1} ${_i2}` ) ;
  }
}

/**
 * Sets up the standard input processing to read data and pass it to the main function.
 * This pattern is common in competitive programming for handling input/output.
 */
function runWithStdin ( )
{
  var input = "" ; // Initialize an empty string to accumulate input.

  process . stdin . resume ( ) ; // Resume stdin to start receiving data.

  process . stdin . setEncoding ( "utf8" ) ; // Set the input encoding to UTF-8.

  // Event listener for incoming data on stdin.
  // Appends chunks of data to the 'input' string.
  process . stdin . on ( "data" , function ( v )
  {
    input += v ;
  } ) ;

  // Event listener for the end of stdin.
  // Splits the accumulated input by newlines and passes it to the main function.
  process . stdin . on ( "end" , function ( )
  {
    main ( input . split ( "\n" ) ) ;
  } ) ;
}

// Execute the function to set up standard input handling and run the main logic.
runWithStdin ( ) ;
/* End of Type I Clone */