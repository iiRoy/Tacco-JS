/*
 * This section contains boilerplate code for input processing.
 * It's generally not part of the core algorithm logic.
 *
 * It handles reading input from standard input,
 * parsing it, and providing helper functions for common data types.
 */
var    read  = require ( 'readline' ) . createInterface ( {
    input   :   process . stdin ,
    output  :   process . stdout
} ) ;

// Declare global variables for input handling
var     obj     ;
var     inLine  =   [ ] ;

/*
 * Event listener for each line of input.
 * Pushes the received line into the 'inLine' array.
 */
read . on ( 'line' , function ( input )
{
    inLine . push ( input ) ;
} ) ;

/*
 * Event listener for the 'close' event, indicating end of input.
 * This is where the main program execution begins.
 */
read . on ( 'close' , function ( ) {

    // Initialize the input object with all collected lines
    obj = init ( inLine ) ;

    // Output a newline to standard error for visual separation
    console . error ( "\n" ) ;

    // Record the start time for performance measurement
    var     start   = Date . now ( ) ;

    // Call the main function of the program
    Main ( ) ;

    // Calculate the elapsed time
    var     end     = Date . now ( ) - start ;

    // Log the execution time to standard error
    myerr ( "time : " + end + "ms" ) ;

    // Log the memory usage to standard error
    myerr ( "memory : " + Math . round ( process . memoryUsage ( ) . heapTotal / 1024 ) + "KB" ) ;

} ) ;


/**
 * Creates a deep clone of a given object using JSON serialization/deserialization.
 * Note: This method has limitations (e.g., cannot clone functions, Dates, RegExps, undefined values).
 *
 * @param {object} obj - The object to be cloned.
 * @returns {object} A deep copy of the input object.
 */
function makeClone ( obj ) {
    return  JSON . parse ( JSON . stringify ( obj ) ) ;
}


/*
 * Helper functions for reading specific data types from the input.
 * These abstract away the parsing logic.
 */
function    nextInt ( )          { return myconv ( next ( ) , 1 ) ; }
function    nextStrArray ( )     { return myconv ( next ( ) , 2 ) ; }
function    nextIntArray ( )     { return myconv ( next ( ) , 4 ) ; }
function    nextCharArray ( )    { return myconv ( next ( ) , 6 ) ; }


/*
 * Retrieves the next line from the input stream.
 *
 * @returns {string} The next line of input.
 */
function    next ( )             { return obj . next ( ) ; }


/*
 * Checks if there are more lines available in the input stream.
 *
 * @returns {boolean} True if more input is available, false otherwise.
 */
function    hasNext ( )          { return obj . hasNext ( ) ; }


/*
 * Initializes the input reader object.
 * This object manages the list of input lines and the current reading position.
 *
 * @param {string[]} input - An array of strings, where each string is a line of input.
 * @returns {object} An object with methods to access input lines.
 */
function    init ( input ) {

    return {
        list    :   input ,             // The complete list of input lines
        index   :   0 ,                 // Current index for reading from 'list'
        max     :   input . length ,    // Total number of input lines

        /*
         * Checks if there are more lines to read.
         * @returns {boolean} True if more input is available.
         */
        hasNext : function ( ) {
            return ( this . index < this . max ) ;
        } ,

        /*
         * Retrieves the next line of input and advances the index.
         * Throws an error if no more input is available.
         * @returns {string} The next input line.
         */
        next    : function ( ) {
            if ( this . hasNext ( ) ) {
                return this . list [ this . index ++ ] ;
            } else {
                throw "ArrayIndexOutOfBoundsException ‚There is no more input" ;
            }
        }
    } ;
}


/*
 * Outputs a string to standard output, followed by a newline.
 * This is the primary function for printing results.
 *
 * @param {string} s - The string to be printed.
 */
function    myout ( s ) {
    console . log ( s ) ;
}


/*
 * Outputs debug information to standard error.
 * Uses 'util.inspect' for detailed object logging.
 *
 * @param {*} s - The value to be inspected and logged.
 */
function    myerr ( s ) {
    console . error ( "debug:" + require ( "util" ) . inspect ( s , false , null ) ) ;
}


/*
 * Universal conversion function for input parsing.
 * The 'no' parameter determines the conversion type.
 *
 * @param {*} i - The input value to convert (usually a string or array).
 * @param {number} no - The conversion type identifier.
 *    1: Parse as integer.
 *    2: Split string by space into an array of strings.
 *    4: Split string by space and convert each part to a number.
 *    6: Split string into an array of single characters.
 *    7: Split string into an array of single characters and convert each to a number.
 *    8: Join array elements with a space.
 *    9: Join array elements with a newline.
 *    0: Join array elements without any separator.
 *    default: Return input as is.
 * @returns {*} The converted value.
 */
function myconv ( i , no ) {
    try {
        switch ( no ) {
            case 1 : // Convert to integer
                return parseInt ( i ) ;
            case 2 : // Split by space into string array
                return i . split ( " " ) ;
            case 4 : // Split by space and map to numbers
                return i . split ( " " ) . map ( Number ) ;
            case 6 : // Split into character array
                return i . split ( "" ) ;
            case 7 : // Split into character array and map to numbers
                return i . split ( "" ) . map ( Number ) ;
            case 8 : // Join array with spaces
                return i . join ( " " ) ;
            case 9 : // Join array with newlines
                return i . join ( "\n" ) ;
            case 0 : // Join array without separator
                return i . join ( "" ) ;
            default : // No conversion, return as is
                return i ;
        }
    } catch ( e ) {
        // In case of conversion error, return the original input
        return i ;
    }
}

/*
 * End of boilerplate code for input/output.
 * The actual problem-solving logic starts below.
 */

/**
 * The main function containing the core logic of the program.
 * It reads input, processes it, and outputs the result.
 */
function Main ( ) {

    // Read the first line of input, expected to be two integers.
    var     one = nextIntArray ( ) ;

    // N: The number of items to unlock.
    var     N   =   one [ 0 ] ;

    // M: The number of available keys/operations.
    var     M   =   one [ 1 ] ;

    // 'list' will store details about each key/operation.
    // It's indexed from 1 to M, so M+1 size.
    var     list        = new Array ( M + 1 ) ;

    // 'unlockList' maps an item (to be unlocked) to a list of keys
    // that can unlock it.
    var     unlockList  = { } ;

    // Loop through M keys/operations to read their details.
    for ( var i = 0 ; i < M ; i ++ ) {

        // Read cost and number of items unlocked by the current key.
        var     one     = nextIntArray ( ) ;
        var     a       = one [ 0 ] ; // Cost of this key
        var     b       = one [ 1 ] ; // Number of items this key unlocks

        // Read the list of items that this key unlocks.
        var     clist   = nextIntArray ( ) ;

        // Store the key's information in 'list'.
        // The index is (i + 1) to match 1-based key numbering.
        list [ i + 1 ] = {
            cost    : a ,           // The cost associated with this key
            success : clist         // Array of items unlocked by this key
        } ;

        // Populate 'unlockList': For each item unlocked by this key,
        // add this key's index to its list of unlocking keys.
        for ( var j = 0 ; j < b ; j ++ ) {
            // If the item doesn't have an entry yet, create an empty array.
            if ( unlockList [ clist [ j ] ] == null ) {
                unlockList [ clist [ j ] ] = [ ] ;
            }
            // Add the current key's index to the list of keys for this item.
            unlockList [ clist [ j ] ] . push ( i + 1 ) ;
        }
    }

    // myerr ( list ) ; // Debug: Print the list of keys
    // myerr ( unlockList ) ; // Debug: Print the mapping of items to keys

    // Initialize total output cost.
    var     output  =   0 ;

    // 'used' set keeps track of items that have already been unlocked.
    var     used    =   new Set ( ) ;

    // Iterate through all N items, from 1 to N.
    for ( var i = 1 ; i <= N ; i ++ ) {

        // If the current item 'i' has not yet been unlocked.
        if ( ! used . has ( i ) ) {

            // Initialize minimum cost to a very large number.
            var     min     = 100000000000 ;

            // Initialize index of the best key to -1.
            var     index   = -1 ;

            // Get the list of keys that can unlock the current item 'i'.
            unlock = unlockList [ i ] ;

            // If no key exists to unlock item 'i', then it's impossible.
            if ( unlock == null ) {
                myout ( -1 ) ; // Output -1 indicating impossibility
                return ;       // Terminate the program
            }

            // Find the cheapest key among those that unlock item 'i'.
            for ( var j = 0 ; j < unlock . length ; j ++ ) {
                if ( min > list [ unlock [ j ] ] . cost ) {
                    min     = list [ unlock [ j ] ] . cost ; // Update minimum cost
                    index   = unlock [ j ] ;                 // Store the index of this key
                }
            }

            // Add the cost of the chosen key to the total output.
            output += min ;

            // Mark all items unlocked by the chosen key as 'used'.
            for ( var j = 0 ; j < list [ index ] . success . length ; j ++ ) {
                used . add ( list [ index ] . success [ j ] ) ;
            }
        }
    }

    // myerr ( used ) ; // Debug: Print the set of all used/unlocked items

    // Output the total minimum cost.
    myout ( output ) ;

}