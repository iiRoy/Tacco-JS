/* This section of code handles input/output operations and utility functions.
 * It's generally boilerplate for competitive programming setups in Node.js.
 * Feel free to ignore the detailed implementation unless debugging I/O.
 */
var   read = require('readline') . createInterface ( {
    input   :   process . stdin ,
    output  :   process . stdout
} );

var obj; // Global object to manage input stream.

var inLine = [ ] ; // Array to store all input lines.

read . on ( 'line', function(input) {
    inLine . push ( input ) ;
} );

read . on ( 'close' , function ( ) {
    obj = init(inLine) ;

    console . error ( "\n" ) ; /* Print a newline to stderr for visual separation */

    var start = Date.now ( ) ; // Record start time for execution measurement.
    Main ( ) ; // Execute the main logic of the program.
    var end = Date . now ( ) - start ; // Calculate execution duration.

    myerr ( "time : " + ( end ) + "ms" ) ; // Output execution time to stderr.

    // Calculate and output memory usage.
    myerr ( "memory : " + Math . round ( process . memoryUsage ( ) . heapTotal / 1024 ) + "KB" ) ;
} ) ;

/* Helper function to create a deep clone of an object.
 * Uses JSON serialization/deserialization for simplicity.
 */
function makeClone ( obj ) {
    return JSON . parse ( JSON . stringify ( obj ) ) ;
}

// Input parsing utility functions, leveraging myconv.
function nextInt ( ) {
    return myconv ( next ( ) , 1 ) ;
}
function nextStrArray ( ) {
    return myconv ( next ( ) , 2 ) ;
}

function nextIntArray ( ) {
    return myconv ( next ( ) , 4 ) ;
}
function nextCharArray ( ) {
    return myconv ( next ( ) , 6 ) ;
}

function next ( ) {
    return obj . next ( ) ;
}
function hasNext ( ) {
    return obj . hasNext ( ) ;
}

/* Initializes the input object with provided lines.
 * This object manages reading lines sequentially.
 */
function init ( input ) {
    var returnObj = {
        list  :   input ,
        index :   0 ,
        max   :   input . length ,

        hasNext : function ( ) {
            return ( this . index < this . max ) ;
        } ,

        next : function ( ) {
            if ( ! this . hasNext ( ) ) {
                throw "ArrayIndexOutOfBoundsException これ以上ないよ" ;
            } else {
                var returnInput = this . list [ this . index ] ;
                this . index ++ ;
                return returnInput ;
            }
        }
    } ;
    return returnObj ;
}

/* Outputs a string to standard output, followed by a newline. */
function myout ( s ) {
    console . log ( s ) ;
}

/* Outputs a debug message to standard error.
 * Uses util.inspect for detailed object inspection.
 */
function myerr ( s ) {
    console . error ( "debug:" + require ( "util" ) . inspect ( s , false , null ) ) ;
}

/*
 * myconv function: Handles various conversions for input data.
 * The 'no' parameter dictates the conversion type.
 *
 * Conversion types:
 *   1: Convert to integer.
 *   2: Split by space into string array.
 *   4: Split by space and convert to number array.
 *   6: Split by character into string array.
 *   7: Split by character and convert to number array.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements without separator.
 * Default: Return input as is (for unknown/error cases).
 */
function myconv ( i , no ) {
    try {
        switch ( no ) {
            case 1 : return parseInt ( i ) ;
            case 2 : return i . split ( " " ) ;
            case 4 : return i . split ( " " ) . map ( Number ) ;
            case 6 : return i . split ( "" ) ;
            case 7 : return i . split ( "" ) . map ( Number ) ;
            case 8 : return i . join ( " " ) ;
            case 9 : return i . join ( "\n" ) ;
            case 0 : return i . join ( "" ) ;
            default : return i ;
        }
    } catch ( e ) {
        return i ;
    }
}

/* Main logic of the program.
 * This function processes two input strings, 's' and 't',
 * and calculates a specific output based on character occurrences.
 */
function Main ( ) {
    var s = next ( ) ; // Get the first input string.
    var t = next ( ) ; // Get the second input string.

    var map = { } ; // Map to store character indices from string 's'.
    var output = 0 ; // Initialize the final output value.

    // Populate the map with character indices from string 's'.
    for ( var i = 0 ; i < s . length ; i ++ ) {
        if ( map [ s [ i ] ] == null ) {
            map [ s [ i ] ] = [ ] ; // Initialize an empty array if character not seen before.
        }
        map [ s [ i ] ] . push ( i ) ; // Add the current index to the character's list.
    }

    var maeIndex = -1 ; // Stores the last matched index in string 's'.
    var loop = 0 ; // Counter for full 's' string traversals.

    // Iterate through string 't' to find occurrences in 's'.
    for ( var i = 0 ; i < t . length ; i ++ ) {
        // If a character from 't' is not found in 's', output -1 and exit.
        if ( map [ t [ i ] ] == null ) {
            myout ( -1 ) ;
            return ;
        }

        if ( i == 0 ) {
            // For the first character of 't'.
            output = map [ t [ i ] ] [ 0 ] + 1 ;
            maeIndex = map [ t [ i ] ] [ 0 ] ;
        } else {
            // For subsequent characters of 't', perform a binary search.
            var index = binarySearch ( map [ t [ i ] ] , maeIndex ) ;

            // Check if we need to loop back to the beginning of 's'.
            if ( index == map [ t [ i ] ] . length || map [ t [ i ] ] [ index ] == maeIndex ) {
                loop ++ ; // Increment loop counter.
                index = 0 ; // Start from the beginning of the character's index list.
            }

            // Calculate the total output.
            output = ( loop * s . length ) + map [ t [ i ] ] [ index ] + 1 ;
            maeIndex = map [ t [ i ] ] [ index ] ; // Update the last matched index.
        }
    }
    myout ( output ) ; // Print the final calculated output.
}

/* Performs a binary search on a sorted list.
 * It finds the smallest index 'ok' such that list[ok] >= search.
 * Assumes 'list' is already sorted in ascending order.
 *
 * Parameters:
 *   list: The sorted array to search within.
 *   search: The value to search for.
 *
 * Returns:
 *   The index of the first element in 'list' that is greater than or equal to 'search'.
 *   If no such element exists (all elements are smaller than 'search'), returns list.length.
 */
function binarySearch ( list , search ) {
    var ng = -1 ; // 'ng' (not good) represents the largest index where list[ng] < search.
    var ok = list . length ; // 'ok' (good) represents the smallest index where list[ok] >= search.

    var center ; // Variable to store the middle index during search.

    while ( Math . abs ( ok - ng ) > 1 ) {
        center = Math . floor ( ( ok + ng ) / 2 ) ; // Calculate the middle index.

        // If the element at 'center' is greater than or equal to 'search',
        // it could be our 'ok' candidate, or something smaller.
        if ( list [ center ] >= search ) {
            ok = center ; // Move 'ok' to 'center'.
        } else {
            // Otherwise, list[center] is less than 'search',
            // so 'center' becomes a new 'ng' candidate.
            ng = center ; // Move 'ng' to 'center'.
        }
    }
    return ok ; // Return the 'ok' index, which is the desired result.
    // The commented-out line below would return the actual value at ng,
    // but the problem requires the index 'ok'.
    // return list[ng];
}