// This section contains boilerplate code for competitive programming in Node.js.
// It handles input/output operations and provides several utility functions.
// Developers should generally ignore the specifics of this part, focusing on the 'Main' function.
// --------------------------------------------------------------------------------------------------

var read = require( 'readline' ).createInterface(
    {
        input:   process.stdin,
        output:  process.stdout
    }
);

var obj;       // This global variable will hold the initialized input handler object.
var inLine = [ ]; // An array to temporarily store all incoming lines from standard input.

// Register a callback to be executed for each line of input received.
read.on(
    'line',
    function( input ) {
        inLine.push( input );
    }
);

// Register a callback to be executed once the entire input stream has ended.
read.on(
    'close',
    function( ) {
        // Initialize the input processing object using all collected lines.
        obj = init( inLine );

        // Output a blank line to the error stream for cleaner separation of debug messages.
        console.error( "\n" );

        // Record the starting timestamp to measure the execution time of the main logic.
        var start = Date.now( );

        // Invoke the primary function containing the problem's solution.
        Main( );

        // Calculate the total time elapsed during the execution of 'Main'.
        var end = Date.now( ) - start;

        // Report the execution time to the error stream.
        myerr( "time : " + ( end ) + "ms" );

        // Report the approximate memory usage (heapTotal) to the error stream.
        myerr( "memory : " + Math.round( process.memoryUsage( ).heapTotal / 1024 ) + "KB" );
    }
);


/*
 * Function: makeClone
 * -------------------
 * Creates a deep copy of a given JavaScript object using JSON serialization/deserialization.
 * This method is suitable for plain data objects without functions, Date objects, or other special types.
 *
 * Parameters:
 *   obj - The object to be cloned.
 *
 * Returns:
 *   A new object that is a deep clone of the input object.
 */
function makeClone( obj ) {
    return JSON.parse( JSON.stringify( obj ) );
}


/* Input Helper Functions */
// These functions simplify reading and converting different types of input from the 'obj' handler.

function nextInt( ) {
    return myconv( next( ), 1 ); // Reads next line and converts to integer.
}

function nextStrArray( ) {
    return myconv( next( ), 2 ); // Reads next line and splits by space into a string array.
}

function nextIntArray( ) {
    return myconv( next( ), 4 ); // Reads next line, splits by space, and converts to an array of numbers.
}

function nextCharArray( ) {
    return myconv( next( ), 6 ); // Reads next line and splits into an array of characters.
}

function next( ) {
    return obj.next( ); // Retrieves the next raw input line from the handler.
}

function hasNext( ) {
    return obj.hasNext( ); // Checks if there are more lines available in the input.
}


/*
 * Function: init
 * --------------
 * Initializes and returns an object responsible for managing the input lines.
 * This object provides methods to sequentially access the input.
 *
 * Parameters:
 *   input - An array of strings, where each string represents a line of input.
 *
 * Returns:
 *   An object with the following properties and methods:
 *     - list: The original array of input lines.
 *     - index: The current position in the 'list' array (zero-based).
 *     - max: The total number of lines in the 'list' array.
 *     - hasNext(): A function that returns true if there are more lines to read, false otherwise.
 *     - next(): A function that returns the next line from the 'list' and increments 'index'.
 *               Throws "ArrayIndexOutOfBoundsException" if no more lines are available.
 */
function init( input ) {
    var returnObj = {
        list  :  input,          // The complete set of input lines.
        index :  0,              // Tracks the current line being processed.
        max   :  input.length,   // Total count of input lines.

        // Checks if there are any remaining input lines.
        hasNext : function( ) {
            return ( this.index < this.max );
        },

        // Retrieves the next available input line.
        next : function( ) {
            if ( !this.hasNext( ) ) {
                // If the end of input is reached, signal an error.
                throw "ArrayIndexOutOfBoundsException これ以上ないよ";
            } else {
                // Fetch the current line, then advance the index for the next call.
                var returnInput = this.list[ this.index ];
                this.index++;
                return returnInput;
            }
        }
    };

    return returnObj;
}


/*
 * Function: myout
 * ---------------
 * A simple wrapper around `console.log` for printing output to standard output.
 *
 * Parameters:
 *   s - The string or object to be printed.
 */
function myout( s ) {
    console.log( s );
}


/*
 * Function: myerr
 * ---------------
 * A debugging utility that prints messages to standard error.
 * It uses Node.js's `util.inspect` to provide a detailed, readable representation of objects.
 *
 * Parameters:
 *   s - The data (string, object, etc.) to be inspected and printed as a debug message.
 */
function myerr( s ) {
    console.error( "debug:" + require( "util" ).inspect( s, false, null ) );
}


/*
 * Function: myconv
 * ----------------
 * A versatile conversion function for various input processing needs.
 * It takes an input 'i' and a numeric code 'no' to determine the conversion type.
 *
 * Parameters:
 *   i  - The input data, typically a string read from input or an array.
 *   no - A numeric code specifying the desired conversion:
 *        1: Convert 'i' to an integer using `parseInt`.
 *        2: Split 'i' (string) by space into an array of strings.
 *        4: Split 'i' (string) by space and map each part to a Number.
 *        6: Split 'i' (string) into an array of single characters.
 *        7: Split 'i' (string) into characters and map each character to a Number.
 *        8: Join elements of 'i' (array) with a space.
 *        9: Join elements of 'i' (array) with a newline character.
 *        0: Join elements of 'i' (array) without any separator.
 *        Default: Return 'i' unchanged if 'no' is not recognized.
 *
 * Returns:
 *   The converted data based on 'no', or the original input 'i' if conversion fails or 'no' is invalid.
 */
function myconv( i, no ) {
    try {
        switch ( no ) {
            case 1:
                return parseInt( i );
            case 2:
                return i.split( " " );
            case 4:
                return i.split( " " ).map( Number );
            case 6:
                return i.split( "" );
            case 7:
                return i.split( "" ).map( Number );
            case 8:
                return i.join( " " );
            case 9:
                return i.join( "\n" );
            case 0:
                return i.join( "" );
            default:
                return i;
        }
    } catch ( e ) {
        // In case of any error during conversion (e.g., calling `split` on non-string),
        // return the original input to prevent crashing.
        return i;
    }
}


// --------------------------------------------------------------------------------------------------
// End of generic utility functions.
// The following functions define the core logic for the specific problem being solved.


/*
 * Function: Main
 * --------------
 * This is the primary function where the problem-solving algorithm is implemented.
 * It reads an integer N, then processes N subsequent integers to build a specific list.
 * The list effectively represents the "tails" of increasing subsequences,
 * a common pattern in Longest Increasing Subsequence (LIS) problems.
 */
function Main( ) {
    // Read the total number of elements to process.
    var N = nextInt( );

    // Initialize an empty array that will store the processed elements.
    var list = [ ];

    // Iterate N times to read and process each element.
    for ( var i = 0; i < N; i++ ) {
        // Read the current integer 'a'.
        var a = nextInt( );

        // Special handling for the very first element.
        if ( i == 0 ) {
            list.push( a ); // Simply add the first element to the list.
            continue;       // Skip the rest of the loop body for the first iteration.
        }

        // Perform a binary search on the current 'list' to find the appropriate position for 'a'.
        var index = binarySearch( list, a );

        // If 'index' equals the current length of the list, it means 'a' is greater than all existing elements.
        if ( index == list.length ) {
            list.push( a ); // Append 'a' to the end of the list.
        } else {
            // Otherwise, 'index' points to an element that 'a' should replace
            // to maintain the non-decreasing property while minimizing the tail value.
            list[ index ] = a;
        }

        // Optional debug line: Uncomment to see the state of 'list' after each element is processed.
        // myerr(list);
    }

    // After processing all N elements, output the final length of the 'list'.
    myout( list.length );
}


/*
 * Function: binarySearch
 * --------------------
 * Performs a binary search on a sorted list to find a specific index.
 * This implementation uses a variant of binary search typically found in LIS (Longest Increasing Subsequence)
 * algorithms, where it identifies an element to be replaced or an insertion point.
 *
 * Assumptions:
 *   - The 'list' array is already sorted in non-decreasing order.
 *
 * Parameters:
 *   list   - The sorted array of numbers to search within.
 *   search - The value to find the position for.
 *
 * Returns:
 *   An index 'ok' based on the search criteria.
 *   This 'ok' represents an index such that `list[ok]` is the first element satisfying a certain condition
 *   relative to 'search', or `list.length` if 'search' is effectively greater than all elements.
 */
function binarySearch( list, search ) {
    // 'ng' (not good) is initialized to -1, representing an index definitely outside the valid range.
    var ng = -1;
    // 'ok' (good) is initialized to list.length, also representing an index outside the valid range.
    var ok = list.length;
    var center; // Variable to store the midpoint index during the search.

    // Continue the search as long as there's a gap of more than one index between 'ok' and 'ng'.
    while ( Math.abs( ok - ng ) > 1 ) {
        // Calculate the middle index. `Math.floor` ensures an integer index.
        center = Math.floor( ( ok + ng ) / 2 );

        // Compare the element at 'center' with the 'search' value.
        if ( list[ center ] < search ) {
            // If the middle element is less than 'search', it means 'search' must be to its right.
            // In this specific binary search variant, 'ok' is updated to 'center'.
            ok = center;
        } else {
            // If the middle element is greater than or equal to 'search', it means 'search' must be at or to its left.
            // Here, 'ng' is updated to 'center'.
            ng = center;
        }
    }

    // After the loop terminates, 'ok' and 'ng' will be adjacent, and 'ok' holds the desired index.
    return ok;
    // The commented line below would return 'ng' instead, which might be useful for a different search criteria.
    // return ng;
}