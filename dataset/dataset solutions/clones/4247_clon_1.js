/*
 * This section contains boilerplate code for input/output handling.
 * You can generally ignore the details here, as it's for environment setup.
 */

var read = require('readline') .createInterface( {
    input: process.stdin,
    output: process.stdout
} );

var obj;       /* Holds the object for custom input reading */
var inLine = [ ]; // Array to store lines read from standard input

// Event listener for each line of input
read.on( 'line' , function ( input ) {
    inLine.push( input );
} );

// Event listener for when input stream closes
read.on( 'close' , function ( ) {
    obj = init( inLine ); // Initialize custom input object with all lines

    myerr( "-----start-----" ); // Debug message for start of execution

    var start = new Date( ); // Record start time
    Main( );                 // Call the main logic function
    var end   = new Date( ) - start; // Calculate elapsed time

    myerr( "----- end -----" ); // Debug message for end of execution
    myerr( "time : " + ( end ) + "ms" ); // Display execution time
    myerr( "memory : " + Math.round( process.memoryUsage( ).heapTotal / 1024 ) + "KB" ); // Display memory usage
} );

// Helper functions for reading various data types from input
function nextInt ( ) { return myconv( next( ) , 1 ); }
function nextStrArray ( ) { return myconv( next( ) , 2 ); }
function nextIntArray ( ) { return myconv( next( ) , 4 ); }
function nextCharArray ( ) { return myconv( next( ) , 6 ); }
function next ( ) { return obj.next( ); }
function hasNext ( ) { return obj.hasNext( ); }

/**
 * Initializes an object for sequential reading of input lines.
 * This object provides methods to check for more input and retrieve the next line.
 * @param {Array<string>} input - An array of strings, where each string is a line of input.
 * @returns {object} An object with methods `hasNext` and `next`.
 */
function init ( input ) {
    var returnObj = {
        list  : input,          // The array of input lines
        index : 0,              // Current index for reading
        max   : input.length,   // Total number of input lines

        /**
         * Checks if there are more lines to read.
         * @returns {boolean} True if there are more lines, false otherwise.
         */
        hasNext : function ( ) {
            return ( this.index < this.max );
        },

        /**
         * Retrieves the next line of input.
         * Throws an error if no more input is available.
         * @returns {string} The next line of input.
         */
        next : function ( ) {
            if ( ! this.hasNext( ) ) {
                throw "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error for out-of-bounds access
            } else {
                var returnInput = this.list[ this.index ]; // Get the current line
                this.index++;                              // Move to the next index
                return returnInput;                        // Return the line
            }
        }
    };

    return returnObj;
}

/**
 * Outputs a string to the console.
 * @param {any} s - The value to be outputted.
 */
function myout ( s ) {
    console.log( s );
}

/**
 * Outputs debug information to the standard error stream.
 * It uses Node.js's `util.inspect` for detailed object inspection.
 * @param {any} s - The value to be debugged.
 */
function myerr ( s ) {
    console.error( "debug:" + require( "util" ) .inspect( s , false , null ) );
}

/*
 * This section describes the behavior of the `myconv` function based on the `no` parameter.
 * It's used for various type conversions and string manipulations.
 *
 * [no] parameter values:
 *   - Unknown/Error: Returns the input `i` as is.
 *   - 1: Converts `i` to an integer.
 *   - 2: Splits `i` by half-width spaces into a string array.
 *   - 4: Splits `i` by half-width spaces and converts parts to a number array.
 *   - 6: Splits `i` into a character array.
 *   - 7: Splits `i` into a character array and converts parts to a number array.
 *   - 8: Joins elements of `i` with half-width spaces.
 *   - 9: Joins elements of `i` with newlines.
 *   - 0: Joins elements of `i` without any separator.
 */
function myconv ( i , no ) {
    try {
        switch ( no ) {
            case 1:
                return parseInt( i ); // Convert to integer
            case 2:
                return i.split( " " ); // Split by space into string array
            case 4:
                return i.split( " " ) .map( Number ); // Split by space, convert to number array
            case 6:
                return i.split( "" ); // Split into character array
            case 7:
                return i.split( "" ) .map( Number ); // Split into character array, convert to number array
            case 8:
                return i.join( " " ); // Join array elements with spaces
            case 9:
                return i.join( "\n" ); // Join array elements with newlines
            case 0:
                return i.join( "" ); // Join array elements without separator
            default:
                return i; // Default case: return input as is
        }
    } catch ( e ) {
        return i; // In case of any error during conversion, return the original input
    }
}

/**
 * The main function containing the core logic of the program.
 * It reads an integer N, then an array of N integers.
 * It processes the list based on specific conditions and outputs a final sum.
 */
function Main ( ) {
    var N    = nextInt( );        // Read the first integer, which is N
    var list = nextIntArray( );   // Read the next line as an array of integers

    // Loop from N-1 down to 0
    for ( var i = N - 1 ; i >= 0 ; i-- ) {
        var no  = i + 1; // Calculate 'no' based on the current index 'i'
        var sum = 0;     // Initialize sum for the inner loop

        // Inner loop: iterate with a step of 'no'
        for ( var j = i ; j < N ; j = j + no ) {
            sum += list[ j ]; // Add elements from the list to sum
        }

        // If the calculated sum is negative, set corresponding elements in the list to 0
        if ( sum < 0 ) {
            for ( var j = i ; j < N ; j = j + no ) {
                list[ j ] = 0; // Set the element to 0
            }
        }
    }

    var output = 0; // Initialize output sum

    // Calculate the final sum of all elements in the modified list
    for ( var i = 0 ; i < N ; i++ ) {
        output += list[ i ]; // Add each element to the output sum
    }

    myout( output ); // Print the final calculated output
}