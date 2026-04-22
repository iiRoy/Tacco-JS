/*
 This JavaScript file contains utility functions for input/output operations
 and a main function that solves a specific problem.
 The input handling is customized for competitive programming environments,
 typically reading from standard input.
*/

var obj = init(); /* Initialize the input object globally. */

Main(); /* Call the primary execution function to start the program logic. */

/**
 * Reads the next token from input and converts it to an integer.
 * @returns {number} The next integer value.
 */
function nextInt( ) { return myconv( next( ) , 1 ); }

/* Reads the next line/token from input and splits it by space into a string array. */
function nextStrArray( ) { return myconv( next( ) , 2 ); } // Splits by half-width space.

// This function reads a line, splits it by spaces, and converts each part to a number.
function nextIntArray( ) { return myconv( next( ) , 4 ); } /* Splits by space + converts to numbers. */

/* Fetches the next token from input and splits it into an array of single characters. */
function nextCharArray( ) { return myconv( next( ) , 6 ); } // Divides into individual characters.

// Retrieves the next available input item using the global 'obj' input handler.
function next( ) { return obj.next( ); }

/**
 * Checks if there are more input items available.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasNext( ) { return obj.hasNext( ); }

/*
 * Reads all input from standard input, trims whitespace, and splits it into lines.
 * This is a utility function for setting up the input source.
 */
function myin( ) {
 return require( "fs" )
  .readFileSync( "/dev/stdin" , "utf8" )
  .trim( )
  .split( "\n" ) ;
}

/*
 * Initializes the input object that manages reading lines from the input file.
 * It provides methods to check for more input and retrieve the next line.
 * @returns {object} An object with input management properties and methods.
 */
function init( ) {
    var inputFile = myin( ); // Get all input lines.

    /*
     * This object holds the input data and state for processing.
     */
    var returnObj = {
        "list" : inputFile, /* Array of all input lines. */
        "index" : 0, /* Current position in the input list. */
        "max" : inputFile.length, /* Total number of input lines. */

        // Method to check if there are more lines to read.
        "hasNext" : function( ) {
            return ( this.index < this.max );
        },

        // Method to get the next line from the input.
        "next" : function( ) {
            if ( !this.hasNext( ) ) {
                return ""; // Return empty string if no more input.
            } else {
                var returnInput = this.list[ this.index ] ; // Get current line.
                this.index++; // Advance to the next line.
                return returnInput; // Return the fetched line.
            }
        }
    };

    return returnObj; // Hand back the fully configured input handler.
}

/* Outputs the given content 't' to standard output, followed by a newline. */
function myout( t ) { console.log( t ); } // Standard output.

/* Outputs the given content 't' to standard error output. */
function myerr( t ) { console.error( t ); } // Standard error output.

/*
 * Comprehensive conversion utility function.
 * It handles various transformations based on the 'no' parameter.
 *
 * [no] parameter values and their corresponding actions:
 *  - 1: Convert input 'i' to an integer.
 *  - 2: Split input 'i' (string) by half-width spaces.
 *  - 4: Split input 'i' by half-width spaces and map each part to a number.
 *  - 6: Split input 'i' (string) into an array of single characters.
 *  - 7: Split input 'i' into characters and map each to a number (if applicable).
 *  - 8: Join elements of array 'i' with half-width spaces.
 *  - 9: Join elements of array 'i' with newline characters.
 *  - 0: Join elements of array 'i' without any separator.
 *  - Default / Unknown / Error: Return 'i' unchanged.
 */
function myconv( i , no ) {
    try {
        switch ( no ) {
            case 1:
                return parseInt( i ); // Convert to integer.
            case 2:
                return i.split( " " ); // Split by space.
            case 4:
                return i.split( " " ).map( ( a ) => Number( a ) ); // Split and convert to numbers.
            case 6:
                return i.split( "" ); // Split into characters.
            case 7:
                return i.split( "" ).map( ( a ) => Number( a ) ); // Split into characters and convert to numbers.
            case 8:
                return i.join( " " ); // Join with spaces.
            case 9:
                return i.join( "\n" ); // Join with newlines.
            case 0:
                return i.join( "" ); // Join without separator.
            default:
                return i; // Return original if no specific conversion.
        }
    } catch ( e ) {
        /* In case of any conversion error, return the original input 'i'. */
        return i;
    }
}

/*
 * The main function encapsulating the core logic of the program.
 * It reads input arrays, sorts them, combines them, and calculates a sum.
 */
function Main( ) {
    // Read the first line which contains five integer parameters.
    var one = nextIntArray( );

    /*
     * Destructure the parameters for clarity.
     * X: Number of elements to pick from alist.
     * Y: Number of elements to pick from blist.
     * A, B, C: Total counts for alist, blist, clist respectively (though A and B are not directly used here for list lengths, they imply sizes).
     */
    var X = one[ 0 ];
    var Y = one[ 1 ];
    var A = one[ 2 ];
    var B = one[ 3 ];
    var C = one[ 4 ];

    // Read the three lists of integers.
    var alist = nextIntArray( );
    var blist = nextIntArray( );
    var clist = nextIntArray( );

    /*
     * Sort 'alist' in descending order.
     * This is crucial for picking the largest 'X' elements later.
     */
    alist.sort( function( a , b ) {
        return b - a; // Descending sort.
    } );

    /*
     * Sort 'blist' also in descending order.
     * This prepares it for selecting the largest 'Y' elements.
     */
    blist.sort( function( a , b ) {
        return b - a; // Descending sort.
    } );

    /*
     * Initialize an array to hold the selected elements from alist and blist,
     * plus all elements from clist.
     */
    var select = [ ];

    // Add the top X elements from alist to the 'select' array.
    for ( var i = 0 ; i < X ; i++ ) {
        select.push( alist[ i ] );
    }

    // Add the top Y elements from blist to the 'select' array.
    for ( var i = 0 ; i < Y ; i++ ) {
        select.push( blist[ i ] );
    }

    // Concatenate all elements from 'clist' to the 'select' array.
    select = select.concat( clist );

    /*
     * Sort the combined 'select' array in descending order.
     * This step is necessary to pick the largest overall X+Y elements.
     */
    select.sort( function( a , b ) {
        return b - a; // Descending sort for the final selection.
    } );

    // Initialize 'output' to accumulate the sum of the largest elements.
    var output = 0;

    /*
     * Sum the first (X + Y) elements from the globally sorted 'select' array.
     * These are the largest possible sum elements from the combined pool.
     */
    for ( var i = 0 ; i < X + Y ; i++ ) {
        output += select[ i ];
    }

    // Print the final calculated sum to standard output.
    myout( output );
}