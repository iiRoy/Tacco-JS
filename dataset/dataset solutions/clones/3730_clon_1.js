"use strict";

// This file contains a collection of utility functions,
// primarily for array and iterator manipulation,
// followed by the main program logic.

/**
 * Converts an iterable into an array, handling non-iterable cases by throwing an error.
 * This function is typically used for spread syntax emulation in older environments.
 *
 * @param {Iterable} arr - The iterable to convert.
 * @returns {Array} A new array containing the elements of the iterable.
 * @throws {TypeError} If the input is not an iterable instance.
 */
function _toConsumableArray ( arr )
{
    return _arrayWithoutHoles ( arr ) || _iterableToArray ( arr ) || _nonIterableSpread ();
}


/**
 * Throws a TypeError indicating an invalid attempt to spread a non-iterable instance.
 * This is a helper for `_toConsumableArray`.
 */
function _nonIterableSpread ()
{
    throw new TypeError ( "Invalid attempt to spread non-iterable instance" );
}


/**
 * Creates a new array from an array-like object without holes.
 * This is a more performant path for actual arrays in `_toConsumableArray`.
 *
 * @param {Array} arr - The array to process.
 * @returns {Array} A new array with elements copied.
 */
function _arrayWithoutHoles ( arr )
{
    if ( Array.isArray ( arr ) )
    {
        for ( var i = 0, arr2 = new Array ( arr.length ); i < arr.length; i++ )
        {
            arr2 [ i ] = arr [ i ];
        }
        return arr2;
    }
}


/**
 * Attempts to convert an iterable or array-like object into an array.
 * This is used for destructuring assignments.
 *
 * @param {Iterable|ArrayLike} arr - The input to convert.
 * @returns {Array} An array representation.
 */
function _toArray ( arr )
{
    return _arrayWithHoles ( arr ) || _iterableToArray ( arr ) || _nonIterableRest ();
}


/**
 * Converts an iterable object into an array.
 * Supports native iterators and `Arguments` objects.
 *
 * @param {Iterable} iter - The iterable object.
 * @returns {Array} A new array created from the iterable.
 */
function _iterableToArray ( iter )
{
    if ( Symbol.iterator in Object ( iter ) || Object.prototype.toString.call ( iter ) === "[object Arguments]" )
    {
        return Array.from ( iter );
    }
}


/**
 * Slices an array or iterable into a new array up to a specified limit.
 * Used for array destructuring with a limited number of elements.
 *
 * @param {Iterable} arr - The array or iterable to slice.
 * @param {number} i - The maximum number of elements to include.
 * @returns {Array} A new array containing up to `i` elements.
 */
function _slicedToArray ( arr, i )
{
    return _arrayWithHoles ( arr ) || _iterableToArrayLimit ( arr, i ) || _nonIterableRest ();
}


/**
 * Throws a TypeError indicating an invalid attempt to destructure a non-iterable instance.
 * This is a helper for `_toArray` and `_slicedToArray`.
 */
function _nonIterableRest ()
{
    throw new TypeError ( "Invalid attempt to destructure non-iterable instance" );
}


/**
 * Extracts elements from an iterable up to a specified limit.
 * This is a complex helper for `_slicedToArray` to handle iterators.
 *
 * @param {Iterable} arr - The iterable source.
 * @param {number} i - The maximum number of elements to extract.
 * @returns {Array} The extracted elements.
 */
function _iterableToArrayLimit ( arr, i )
{
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try
    {
        for ( var _i = arr [ Symbol.iterator ] (), _s; ! ( _n = ( _s = _i.next () ).done ); _n = true )
        {
            _arr.push ( _s.value );
            if ( i && _arr.length === i )
            {
                break;
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
            if ( ! _n && _i [ "return" ] != null )
            {
                _i [ "return" ] ();
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


/**
 * Returns the input array if it is indeed an array.
 * This is a fast path for array inputs in destructuring helpers.
 *
 * @param {Array} arr - The potential array.
 * @returns {Array|void} The array if valid, otherwise undefined.
 */
function _arrayWithHoles ( arr )
{
    if ( Array.isArray ( arr ) )
    {
        return arr;
    }
}


// The main application logic resides within the _main function.
function _main ()
{
    // Self-executing anonymous function to encapsulate the main logic
    // and process input from standard input.
    ( function ( input )
    {
        // Split the entire input string by newline characters to get individual lines.
        var lines = input.split ( "\n" );

        // Process the first line to extract the integer K.
        // This involves splitting the line and parsing the number.
        var _splitNum = splitNum ( lines [ 0 ] ),
            _splitNum2 = _slicedToArray ( _splitNum, 1 ),
            K = _splitNum2 [ 0 ];

        // Initialize variables for the sequence generation.
        var suffix = ""; // Stores the "0" suffix
        var cur = 1;      // Current digit to print

        // Iterator control variables for the loop below.
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try
        {
            // Loop K times using a custom range generator.
            // This loop generates and prints numbers in a specific pattern.
            for ( var _iterator = range ( 0, K ) [ Symbol.iterator ] (), _step;
                  ! ( _iteratorNormalCompletion = ( _step = _iterator.next () ).done );
                  _iteratorNormalCompletion = true )
            {
                _step.value; // The actual value from the iterator is not used directly.

                // Print the current number followed by its suffix.
                console.log ( `${ cur }${ suffix }` );

                // Increment the current digit.
                cur++;

                // If the current digit exceeds 9, reset it to 1 and append a "0" to the suffix.
                // This creates the sequence 1, 2, ..., 9, 10, 20, ..., 90, 100, 200, ...
                if ( cur > 9 )
                {
                    cur = 1;
                    suffix += "0";
                }
            }
        }
        catch ( err )
        {
            _didIteratorError = true;
            _iteratorError = err;
        }
        finally
        {
            // Ensure the iterator is properly closed if it's not done.
            try
            {
                if ( ! _iteratorNormalCompletion && _iterator.return != null )
                {
                    _iterator.return ();
                }
            }
            finally
            {
                // Re-throw any caught iterator errors.
                if ( _didIteratorError )
                {
                    throw _iteratorError;
                }
            }
        }
    } ) ( require ( "fs" ).readFileSync ( "/dev/stdin", "utf8" ) );


    /**
     * Parses a line of space-separated numbers into an array of integers.
     *
     * @param {string|Array} line - The input line or array of strings.
     * @returns {Array<number>} An array of parsed integers.
     */
    function splitNum ( line )
    {
        return ( Array.isArray ( line ) ? line : line.split ( /\s+/ ) ).map ( function ( n )
        {
            return parseInt ( n );
        } );
    }


    /**
     * A generator function that iterates over integers in the range [start, end).
     *
     * @param {number} start - The starting integer (inclusive).
     * @param {number} end - The ending integer (exclusive).
     * @yields {number} The next integer in the sequence.
     */
    function * range ( start, end )
    {
        for ( var i = start; i < end; i++ )
        {
            yield i;
        }
    }

    /*
     * This section could contain other utility functions, for example:
     * function* rangeDesc(start, end) { ... }
     * but it is currently commented out or removed in the original code.
     */

}

// Execute the main function to start the program.
_main ();