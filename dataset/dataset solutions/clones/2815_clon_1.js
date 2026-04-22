/* This is a Type I clone of the original JavaScript code. */
/* Whitespace and comments have been extensively modified. */
/* All identifiers, operators, and expressions remain unchanged. */

'use strict'; // Enforce strict mode for cleaner code execution.

/**
 * Helper function to slice an array into a specified number of elements.
 * Part of Babel's transpilation for array destructuring.
 * @param {Array} arr - The array to slice.
 * @param {number} i - The number of elements to extract.
 * @returns {Array} Sliced array or throws an error if not iterable.
 */
function _slicedToArray( arr , i )
{
    return _arrayWithHoles( arr )
            || _iterableToArrayLimit( arr , i )
            || _unsupportedIterableToArray( arr , i )
            || _nonIterableRest();
}


/*
 * Throws a TypeError when an invalid attempt to destructure a non-iterable instance occurs.
 * This is a standard error message for such scenarios.
 */
function _nonIterableRest( )
{
    throw new TypeError( "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method." );
}


// Another Babel helper function for handling various array-like objects.
// It tries to convert different types of objects into a proper array.
function _unsupportedIterableToArray( o , minLen )
{
  if ( ! o ) return; // If object is null or undefined, do nothing.

  if ( typeof o === "string" )
  {
    return _arrayLikeToArray( o , minLen ); // Handle string type.
  }

  var n = Object.prototype.toString.call( o ).slice( 8 , -1 ); // Get internal [[Class]] property.

  if ( n === "Object" && o.constructor )
  {
    n = o.constructor.name; // Use constructor name if available.
  }

  if ( n === "Map" || n === "Set" )
  {
    return Array.from( o ); // Convert Map or Set to Array.
  }

  if ( n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test( n ) )
  {
    return _arrayLikeToArray( o , minLen ); // Handle Arguments object or Typed Arrays.
  }
}


/**
 * Converts an array-like object into a real array up to a specified length.
 * @param {Array} arr - The source array-like object.
 * @param {number} len - The maximum length of the resulting array.
 * @returns {Array} A new array containing elements from the source.
 */
function _arrayLikeToArray( arr , len )
{
  if ( len == null || len > arr.length )
  {
    len = arr.length; // Adjust length if not specified or too large.
  }

  for ( var i = 0 , arr2 = new Array( len ); i < len; i++ )
  {
    arr2[ i ] = arr[ i ]; // Copy elements one by one.
  }
  return arr2;
}


/*
 * Limits iteration over an iterable to a specific number of elements.
 * This function handles various aspects of iteration, including symbol-based iterators.
 */
function _iterableToArrayLimit( arr , i )
{
    if ( typeof Symbol === "undefined" || !( Symbol.iterator in Object( arr ) ) ) return;

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try
    {
        for ( var _i = arr[ Symbol.iterator ](), _s; ! ( _n = ( _s = _i.next() ).done ); _n = true )
        {
            _arr.push( _s.value );
            if ( i && _arr.length === i )
            {
                break; // Stop if the desired limit is reached.
            }
        }
    }
    catch ( err )
    {
        _d = true;
        _e = err;
    }
    finally
    {
        try
        {
            if ( ! _n && _i[ "return" ] != null )
            {
                _i[ "return" ]();
            }
        }
        finally
        {
            if ( _d )
            {
                throw _e;
            }
        }
    }
    return _arr;
}


// Checks if the given argument is an actual array.
// If it is, it returns the array itself.
function _arrayWithHoles( arr )
{
  if ( Array.isArray( arr ) )
  {
    return arr;
  }
}


/*
 * The main function that processes input lines for the ABC 131 E problem.
 * It calculates and prints a specific sequence of numbers based on N and K.
 */
function main( lines )
{
    // Parse N and K from the first line of input.
    var _lines$0$split$map = lines[ 0 ].split( ' ' ).map( Number ),
        _lines$0$split$map2 = _slicedToArray( _lines$0$split$map , 2 ),
        N = _lines$0$split$map2[ 0 ], // First number is N.
        K = _lines$0$split$map2[ 1 ]; // Second number is K.

    // Initialize M with N, and a boolean flag 'ok'.
    var M = N,
        ok;

    // Loop to find a suitable value for M.
    // The loop iterates downwards from N.
    for ( ; M >= 1 ; M-- )
    {
        var L = N - M + 1; // Calculate L based on N and current M.

        // Check the condition for K. This formula is specific to the problem.
        if ( ( L - 1 ) * ( L - 2 ) / 2 + M - 1 === K )
        {
            ok = true; // Set flag to true if condition met.
            break;     // Exit loop as M is found.
        }
    }

    // If no suitable M was found, output -1.
    if ( ! ok )
    {
        console.log( -1 );
        return;
    }

    // Output N - 1 as per problem requirements.
    console.log( N - 1 );

    // First loop: Print edges from 1 to M.
    for ( var i = 1 ; i <= M ; i++ )
    {
        console.log( `${ i } ${ i + 1 }` );
    }

    // Second loop: Print remaining edges.
    for ( var _i2 = M + 2 ; _i2 <= N ; _i2++ )
    {
        console.log( `${ M + 1 } ${ _i2 }` );
    }
}


/*
 * Sets up standard input processing to run the main logic.
 * This is a common pattern for competitive programming in Node.js.
 */
function runWithStdin( )
{
    var input = ""; // Initialize an empty string to accumulate input.
    process.stdin.resume(); // Resume stdin to start listening for data.
    process.stdin.setEncoding( "utf8" ); // Set encoding to UTF-8.

    // Event listener for incoming data chunks.
    process.stdin.on( "data" , function( v )
    {
        input += v; // Append data to the input string.
    } );

    // Event listener for the 'end' of input stream.
    process.stdin.on( "end" , function( )
    {
        main( input.split( "\n" ) ); // Split input by newlines and pass to main function.
    } );
}

runWithStdin(); // Execute the function to start listening for input.
// End of the program.