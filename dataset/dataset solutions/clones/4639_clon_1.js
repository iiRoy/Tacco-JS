/*
 * This section of code handles input/output and utility functions.
 * It's generally boilerplate for competitive programming setups.
 */
// ↓ You can ignore this part! Starting here --------------------------------------------------
var read = require( 'readline' ) . createInterface( {
    input: process . stdin,   // Standard input stream
    output: process . stdout  // Standard output stream
} );

var obj; // Global object to manage input lines
var inLine = []; // Array to store all input lines


// Event listener for each line of input
read . on( 'line', function ( input ) {
    inLine . push( input );
} );

// Event listener for when input stream closes
read . on( 'close', function () {
    obj = init( inLine ); // Initialize the input object

    console . error( "\n" ); // Print a newline to stderr for visual separation

    var start = new Date( ); // Record start time for execution

    Main( ); // Execute the main logic of the program

    var end = new Date( ) - start; // Calculate elapsed time

    // Output execution time to stderr
    myerr( "time : " + ( end ) + "ms" );
    // Output memory usage to stderr
    myerr( "memory : " + Math . round( process . memoryUsage( ) . heapTotal / 1024 ) + "KB" );
} );

/**
 * Creates a deep clone of a given object using JSON serialization.
 * Note: This method has limitations (e.g., cannot clone functions, Date objects lose type).
 * @param {object} obj - The object to clone.
 * @returns {object} A deep clone of the input object.
 */
function makeClone( obj ) {
    return JSON . parse( JSON . stringify( obj ) );
}


// Utility functions for parsing various types of input from the global 'obj' input manager.
function nextInt( ) {
    return myconv( next( ), 1 );
}

function nextStrArray( ) {
    return myconv( next( ), 2 );
}

function nextIntArray( ) {
    return myconv( next( ), 4 );
}

function nextCharArray( ) {
    return myconv( next( ), 6 );
}

function next( ) {
    return obj . next( );
}

function hasNext( ) {
    return obj . hasNext( );
}

/*
 * Initializes an input management object.
 * This object provides methods to check for more input and retrieve the next line.
 */
function init( input ) {
    var returnObj = {
        list : input, // Stores all input lines
        index : 0,    // Current position in the input list
        max : input . length, // Total number of input lines

        /**
         * Checks if there are more lines to read.
         * @returns {boolean} True if more input is available, false otherwise.
         */
        hasNext : function ( ) {
            return ( this . index < this . max );
        },

        /**
         * Retrieves the next line of input.
         * Throws an error if no more input is available.
         * @returns {string} The next line from the input list.
         */
        next : function ( ) {
            if ( !this . hasNext( ) ) {
                throw "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error message in Japanese
            } else {
                var returnInput = this . list[ this . index ];
                this . index++; // Move to the next line
                return returnInput;
            }
        }
    };
    return returnObj; // Return the initialized input object
}

// Function to output to standard output (console.log).
function myout( s ) {
    console . log( s );
}

// Function to output debug messages to standard error (console.error).
function myerr( s ) {
    // Uses Node.js 'util' to inspect objects for better debug output
    console . error( "debug:" + require( "util" ) . inspect( s, false, null ) );
}

/**
 * myconv function: Handles various conversions for input data.
 * @param {*} i - The input data to convert.
 * @param {number} no - A numeric code indicating the type of conversion to perform.
 *
 * Conversion codes:
 * 1: Convert to integer.
 * 2: Split by space into a string array.
 * 4: Split by space and convert to a number array.
 * 6: Split by character into a string array.
 * 7: Split by character and convert to a number array.
 * 8: Join array elements with space.
 * 9: Join array elements with newline.
 * 0: Join array elements without separator.
 * Default: Return input as is.
 *
 * @returns {*} The converted data or the original input if conversion fails or code is unknown.
 */
function myconv( i, no ) {
    try {
        switch ( no ) {
            case 1:
                return parseInt( i );
            case 2:
                return i . split( " " );
            case 4:
                return i . split( " " ) . map( Number );
            case 6:
                return i . split( "" );
            case 7:
                return i . split( "" ) . map( Number );
            case 8:
                return i . join( " " );
            case 9:
                return i . join( "\n" );
            case 0:
                return i . join( "" );
            default:
                return i;
        }
    } catch ( e ) {
        // If an error occurs during conversion, return the original input
        return i;
    }
}

// ↑ You can ignore this part! Ends here --------------------------------------------------


/**
 * Main function: Contains the core logic for the problem.
 * This function is called after all input has been read and parsed.
 */
function Main( ) {
    var one = nextIntArray( ); // Read the first line as an array of integers
    var N = one[ 0 ]; // First element is N
    var K = one[ 1 ]; // Second element is K

    var list = nextIntArray( ); // Read the next line as a list of integers
    var output = Math . pow( 10, 15 ); // Initialize output with a very large number (infinity)

    // Special case: If K is 1, the cost is 0 as we only need to select one element.
    if ( K == 1 ) {
        myout( 0 ); // Output 0
        return;   // Exit the function
    }

    // Iterate through all possible subsets using bit manipulation
    // (1 << N) generates 2^N, representing all subsets of N elements
    for ( var i = 0; i < ( 1 << N ); i++ ) {
        var selected = [ list[ 0 ] ]; // Always include the first element

        // Build the current subset based on bitmask 'i'
        for ( var j = 1; j < N; j++ ) {
            // Check if the j-th bit is set in 'i'
            if ( ( i & ( 1 << j ) ) != 0 ) {
                // If bit is set, select the j-th element
                selected . push( list[ j ] );
            }
        }

        // Process only if the selected subset has at least K elements
        if ( selected . length >= K ) {
            var sum = 0; // Initialize sum of costs for this subset
            // myerr(selected); // Debug: print the current selected subset

            // Iterate through the selected elements to adjust them and calculate cost
            for ( var j = 0; j < selected . length - 1; j++ ) {
                // If current element is greater than or equal to the next element
                if ( selected[ j ] >= selected[ j + 1 ] ) {
                    // Calculate cost to make next element strictly greater
                    var costToAdjust = selected[ j ] - selected[ j + 1 ] + 1;
                    sum += costToAdjust; // Add cost to total sum
                    selected[ j + 1 ] += costToAdjust; // Adjust the next element
                }
            }
            // Update the minimum output with the current sum
            output = Math . min( output, sum );
        }
    }

    myout( output ); // Output the final minimum cost
}