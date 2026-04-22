"use strict";

// Helper function to convert an array-like structure to a proper array.
// This is typically used for destructuring assignments.
function _toArray( arr ) {
    return _arrayWithHoles( arr ) || _iterableToArray( arr ) || _nonIterableRest();
}


// Helper function to convert an iterable to an array.
// Handles various iterable types, including arguments objects.
function _iterableToArray( iter )
{
    if ( Symbol.iterator in Object( iter ) || Object.prototype.toString.call( iter ) === "[object Arguments]" )
    {
        return Array.from( iter );
    }
}


// Helper function for array destructuring with a limit.
function _slicedToArray( arr, i )
{
    return _arrayWithHoles( arr ) || _iterableToArrayLimit( arr, i ) || _nonIterableRest();
}


// Helper function to throw an error when destructuring a non-iterable.
function _nonIterableRest()
{
    throw new TypeError( "Invalid attempt to destructure non-iterable instance" );
}


// Helper function to convert an iterable to an array with a specified limit.
function _iterableToArrayLimit( arr, i )
{
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try
    {
        for ( var _i = arr[ Symbol.iterator ](), _s; !( _n = ( _s = _i.next() ).done ); _n = true )
        {
            _arr.push( _s.value );
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
            if ( !_n && _i[ "return" ] != null )
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


// Helper function to check if an argument is an array and return it.
function _arrayWithHoles( arr )
{
    if ( Array.isArray( arr ) )
    {
        return arr;
    }
}


// Main self-executing anonymous function.
!function ()
{

    // Function to parse a line of space-separated numbers into an array of integers.
    // It can also accept an array directly.
    function splitNum( line )
    {
        return ( Array.isArray( line ) ? line : line.split( /\s+/ ) ).map( function ( n )
        {
            return parseInt( n );
        } );
    }


    // Another self-executing anonymous function that takes input.
    !function ( input )
    {
        // Split the input string into an array of lines.
        var lines = input.split( "\n" );

        // Parse the first line to get N and M.
        var _splitNum = splitNum( lines[ 0 ] ),
            _splitNum2 = _slicedToArray( _splitNum, 2 ),
            N = _splitNum2[ 0 ], // N: number of switches
            M = _splitNum2[ 1 ]; // M: number of lights

        // Process subsequent lines to get light configurations.
        var lights = lines.slice( 1, M + 1 ).map( function ( line, i )
        {
            var _splitNum3 = splitNum( line ),
                _splitNum4 = _toArray( _splitNum3 ),
                k = _splitNum4[ 0 ], // k: number of switches connected to this light
                s = _splitNum4.slice( 1 ); // s: array of switch indices

            return {
                k: k,
                s: s,
                li: i // li: original index of the light
            };
        } );

        // Parse the line containing the required parity for each light.
        var ps = splitNum( lines[ M + 1 ] ); // ps: array of parities (0 or 1)

        var count = 0; // Initialize a counter for valid switch combinations.

        // Loop through all possible combinations of switch states (2^N possibilities).
        ll: for ( var i = 0; i < Math.pow( 2, N ); i++ )
        {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try
            {
                // Iterate over each light to check if its condition is met.
                for ( var _iterator = lights[ Symbol.iterator ](), _step; !( _iteratorNormalCompletion = ( _step = _iterator.next() ).done ); _iteratorNormalCompletion = true )
                {
                    var _step$value = _step.value,
                        s = _step$value.s, // switches connected to current light
                        li = _step$value.li; // index of current light

                    var swc = 0; // Initialize switch counter for current light.

                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try
                    {
                        // Iterate through the switches connected to the current light.
                        for ( var _iterator2 = s[ Symbol.iterator ](), _step2; !( _iteratorNormalCompletion2 = ( _step2 = _iterator2.next() ).done ); _iteratorNormalCompletion2 = true )
                        {
                            var si = _step2.value; // Switch index (1-based).

                            // Check if the current switch (si) is 'on' in the current combination (i).
                            // `i & (1 << (si - 1))` uses bitwise AND to check the (si-1)-th bit of i.
                            if ( i & 1 << si - 1 )
                            {
                                swc++; // Increment count of 'on' switches for this light.
                            }
                        }
                    }
                    catch ( err )
                    {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    }
                    finally
                    {
                        try
                        {
                            if ( !_iteratorNormalCompletion2 && _iterator2.return != null )
                            {
                                _iterator2.return();
                            }
                        }
                        finally
                        {
                            if ( _didIteratorError2 )
                            {
                                throw _iteratorError2;
                            }
                        }
                    }

                    // If the parity of 'on' switches does not match the required parity for this light,
                    // this combination is invalid. Continue to the next 'i' (next switch combination).
                    if ( swc % 2 !== ps[ li ] )
                    {
                        continue ll; // Jump to the next iteration of the outer loop.
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
                try
                {
                    if ( !_iteratorNormalCompletion && _iterator.return != null )
                    {
                        _iterator.return();
                    }
                }
                finally
                {
                    if ( _didIteratorError )
                    {
                        throw _iteratorError;
                    }
                }
            }

            // If all lights' conditions are met for the current switch combination, increment the overall count.
            count++;
        }

        // Output the final count of valid switch combinations.
        console.log( count );

    }( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

}();