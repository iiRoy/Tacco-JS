/*
 * This section contains utility functions for input/output and common operations.
 * It's generally boilerplate for competitive programming setups.
 */

var read = require( 'readline' ).createInterface( {
    input : process.stdin,
    output: process.stdout
} );

var obj; // Global object to handle input parsing
var inLine = [ ]; // Array to store all input lines

// Event listener for each line of input
read.on( 'line', function ( input ) {
    inLine.push( input );
} );

// Event listener for when input stream closes
read.on( 'close', function ( ) {
    // Initialize the input object once all lines are read
    obj = init( inLine );
    
    // Debug message indicating input/output flow
    console.error( '\n↑入力 ↓出力' );
    
    // Call the main program logic
    Main( );
} );

/*
 * Creates a deep clone of an object.
 * Handles Set objects specifically, otherwise uses JSON serialization.
 */
function makeClone ( obj ) {
    return ( obj instanceof Set )
        ? new Set( Array.from( obj ) )
        : JSON.parse( JSON.stringify( obj ) );
}

/**
 * Helper functions to get next input in various formats.
 * They all rely on the `myconv` function for type conversion.
 */
function nextInt ( ) {
    return myconv( next( ), 1 );
}

function nextStrArray ( ) {
    return myconv( next( ), 2 );
}

function nextIntArray ( ) {
    return myconv( next( ), 4 );
}

function nextCharArray ( ) {
    return myconv( next( ), 6 );
}

function next ( ) {
    return obj.next( );
}

function hasNext ( ) {
    return obj.hasNext( );
}

/*
 * Initializes an input handler object.
 * This object manages reading lines sequentially.
 */
function init ( input ) {
    return {
        list  : input,
        index : 0,
        max   : input.length,

        // Checks if there are more lines to read
        hasNext : function ( ) {
            return ( this.index < this.max );
        },

        // Retrieves the next line of input
        next : function ( ) {
            if ( this.hasNext( ) ) {
                return this.list[ this.index++ ];
            } else {
                throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
            }
        }
    };
}

/*
 * Prints a message to standard output.
 */
function myout ( s ) {
    console.log( s );
}

/*
 * Prints a debug message to standard error.
 * Uses `util.inspect` for detailed object output.
 */
function myerr ( s ) {
    console.error( 'debug:' + require( 'util' ).inspect( s, false, null ) );
}

/*
 * Comment block explaining the 'no' parameter for the 'myconv' function.
 * This function handles various input conversions and array manipulations.
 *
 * param "no" is an integer code:
 *   - unknown or outlier : returns `i` as is.
 *   - 1: Parses `i` as an integer.
 *   - 2: Splits `i` by space into a string array.
 *   - 4: Splits `i` by space and maps to numbers (integer array).
 *   - 6: Splits `i` into a character array.
 *   - 7: Splits `i` into a character array and maps to numbers.
 *   - 8: Joins array `i` with spaces.
 *   - 9: Joins array `i` with newlines.
 *   - 0: Joins array `i` with no characters (concatenates).
 */
function myconv ( i, no ) {
    try {
        switch ( no ) {
            case 1:
                return parseInt( i );
            case 2:
                return i.split( ' ' );
            case 4:
                return i.split( ' ' ).map( Number );
            case 6:
                return i.split( '' );
            case 7:
                return i.split( '' ).map( Number );
            case 8:
                return i.join( ' ' );
            case 9:
                return i.join( '\n' );
            case 0:
                return i.join( '' );
            default:
                return i;
        }
    } catch ( e ) {
        // In case of conversion error, return original input
        return i;
    }
}

/*
 * End of boilerplate utility functions.
 * The core logic of the program begins below.
 */


function Main ( ) {

    var N = nextInt( ); // Read the number of elements

    // Read the three lists of integers
    var alist = nextIntArray( );
    var blist = nextIntArray( );
    var clist = nextIntArray( );

    // Sort all three lists in ascending order using the custom comparator 's'
    alist.sort( s );
    blist.sort( s );
    clist.sort( s );

    var output = 0; // Initialize the result variable

    // Iterate through each element in blist
    for ( var i = 0; i < N; i++ ) {
        // Find the count of elements in alist less than blist[i]
        var mae = binarySearch( alist, blist[ i ], true );
        // Find the count of elements in clist greater than blist[i]
        var ato = binarySearch( clist, blist[ i ], false );
        
        // Add the product to the total output
        output += mae * ato;
    }

    // Print the final calculated output
    myout( output );
}

/*
 * Custom comparator function for sorting numbers in ascending order.
 * Used by Array.prototype.sort().
 */
function s ( a, b ) {
    return a - b;
}

/*
 * Performs a binary search on a sorted list.
 *
 * @param {Array<Number>} list   The sorted array to search within.
 * @param {Number}        search The value to search for.
 * @param {boolean}       isA    If true, counts elements < search. If false, counts elements > search.
 * @returns {Number}             The count of elements satisfying the condition.
 */
function binarySearch ( list, search, isA ) {

    var ng = -1;             // 'ng' (no good) pointer, initially outside the array bounds
    var ok = list.length;    // 'ok' (good) pointer, initially outside the array bounds

    // Binary search loop: continues as long as there's a gap between 'ok' and 'ng'
    while ( Math.abs( ok - ng ) > 1 ) {

        // Calculate the middle index
        var center = Math.floor( ( ok + ng ) / 2 );

        if ( isA ) { // Case for finding elements LESS THAN 'search' (for 'alist')
            if ( list[ center ] >= search ) {
                ok = center; // If current element is >= search, it could be our upper bound or to its left
            } else {
                ng = center; // If current element is < search, it could be our lower bound or to its right
            }
        } else { // Case for finding elements GREATER THAN 'search' (for 'clist')
            if ( list[ center ] > search ) {
                ok = center; // If current element is > search, it could be our upper bound or to its left
            } else {
                ng = center; // If current element is <= search, it could be our lower bound or to its right
            }
        }
    }

    if ( isA ) {
        // For 'isA' (count elements < search), 'ng' will point to the largest element < search.
        // So, 'ng + 1' gives the count of such elements.
        return ng + 1;
    } else {
        // For 'isA' (false, count elements > search), 'ok' will point to the smallest element > search.
        // Or, if no such element, 'ok' will be list.length.
        // We need to adjust 'ng' if 'ok' points to an element equal to 'search'.
        if ( ok != list.length && list[ ok ] == search ) {
            ng++;
        }
        // The count of elements greater than 'search' is list.length - (index of first element not greater than search).
        // 'ng + 1' represents the count of elements <= search.
        // So, list.length - (ng + 1) gives the count of elements > search.
        return list.length - ( ng + 1 );
    }
}