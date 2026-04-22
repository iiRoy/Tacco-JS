/*
 * This section contains utility functions for input/output and common operations.
 * It's generally boilerplate code for competitive programming environments.
 * You can skip reading this part if you're only interested in the core logic.
 * ----------------------------------------------------------------------------------------------------
 */

var read = require('readline') . createInterface ( {

    input : process.stdin,

    output : process.stdout

} );

var obj; // Stores the object for input handling

var inLine = [ ] ; // Array to hold input lines

read . on ( 'line' , function ( input ) {
    inLine . push ( input ) ;
} ) ;

read . on ( 'close' , function ( ) {

    obj = init ( inLine ) ; // Initialize input object

    console.error ( "\n" ) ; // Print a newline to stderr for readability

    var start = new Date ( ) ; // Record start time for performance measurement

    Main ( ) ; // Execute the main logic of the program

    var end = new Date ( ) - start ; // Calculate elapsed time

    myerr ( "time : " + ( end ) + "ms" ) ; // Output execution time

    // Output memory usage, rounded to KB
    myerr ( "memory : " + Math . round ( process . memoryUsage ( ) . heapTotal / 1024 ) + "KB" ) ;

} ) ;

// Creates a deep clone of an object using JSON serialization/deserialization
function makeClone ( obj ) {
    return JSON . parse ( JSON . stringify ( obj ) ) ;
}

// Retrieves the next integer from input
function nextInt ( ) {
    return myconv ( next ( ) , 1 ) ;
}

// Retrieves the next line as a string array (split by space)
function nextStrArray ( ) {
    return myconv ( next ( ) , 2 ) ;
}

// Retrieves the next line as an integer array (split by space)
function nextIntArray ( ) {
    return myconv ( next ( ) , 4 ) ;
}

// Retrieves the next line as a character array
function nextCharArray ( ) {
    return myconv ( next ( ) , 6 ) ;
}

// Retrieves the next raw input token
function next ( ) {
    return obj . next ( ) ;
}

// Checks if there is more input available
function hasNext ( ) {
    return obj . hasNext ( ) ;
}

// Initializes the input object with provided lines
function init ( input ) {

    var returnObj = {

        list : input , // The array of input lines

        index : 0 , // Current index in the input list

        max : input . length , // Total number of input lines

        // Method to check if more input lines are available
        hasNext : function ( ) {
            return ( this . index < this . max ) ;
        } ,

        // Method to get the next input line
        next : function ( ) {
            if ( ! this . hasNext ( ) ) {
                throw "ArrayIndexOutOfBoundsException これ以上ないよ" ; // Error if no more input
            } else {
                var returnInput = this . list [ this . index ] ; // Get current line
                this . index ++ ; // Move to the next line
                return returnInput ;
            }
        }

    } ;

    return returnObj ;

}

// Prints a value to standard output
function myout ( s ) {
    console . log ( s ) ;
}

// Prints a debug message to standard error
function myerr ( s ) {
    console . error ( "debug:" + require ( "util" ) . inspect ( s , false , null ) ) ;
}

/*
 * Utility function for type conversion based on a 'no' parameter.
 * 'no' parameter definitions:
 *   1: Convert to integer.
 *   2: Split string by space into a string array.
 *   4: Split string by space and convert to a number array.
 *   6: Split string by character into a character array.
 *   7: Split string by character and convert to a number array.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements without any separator.
 *   Default: Return input as is.
 *   Handles unknown/abnormal cases by returning the input unchanged.
 */
function myconv ( i , no ) {
    try {
        switch ( no ) {
            case 1 :
                return parseInt ( i ) ;
            case 2 :
                return i . split ( " " ) ;
            case 4 :
                return i . split ( " " ) . map ( Number ) ;
            case 6 :
                return i . split ( "" ) ;
            case 7 :
                return i . split ( "" ) . map ( Number ) ;
            case 8 :
                return i . join ( " " ) ;
            case 9 :
                return i . join ( "\n" ) ;
            case 0 :
                return i . join ( "" ) ;
            default :
                return i ;
        }
    } catch ( e ) {
        return i ;
    }
}

/*
 * End of boilerplate utility functions.
 * ----------------------------------------------------------------------------------------------------
 */

function Main ( ) {

    // Read the first line of input, expected to contain N and K
    var one = nextIntArray ( ) ;

    var N = one [ 0 ] ; // Total number of buildings
    var K = one [ 1 ] ; // Minimum number of buildings to be visible

    // Read the second line of input, containing heights of N buildings
    var list = nextIntArray ( ) ;

    // Initialize minimum cost to a very large number
    var output = Math . pow ( 10 , 16 ) ;

    // Edge case: If only one building needs to be visible, cost is 0
    if ( K == 1 ) {
        myout ( 0 ) ;
        return ;
    }

    // Iterate through all possible subsets of buildings (2^N combinations)
    for ( var i = 0 ; i < ( 1 << N ) ; i ++ ) {

        var sum = 0 ; // Current cost for this combination
        var maxH = 0 ; // Maximum height encountered so far from left
        var selected = 0 ; // Number of buildings selected to be visible

        // Iterate through each building
        for ( var j = 0 ; j < N ; j ++ ) {

            // Check if the current building 'j' is part of the selected subset 'i'
            if ( ( i & ( 1 << j ) ) != 0 ) {

                selected ++ ; // Increment count of selected buildings

                // If the current building is not tall enough to be visible from the left
                if ( maxH >= list [ j ] ) {

                    // Increase its height to be 'maxH + 1' and add cost
                    sum += maxH - list [ j ] + 1 ;
                    maxH ++ ; // Update maxH after increasing current building's height
                }
            }

            // Update maxH to be the maximum of its current value and the current building's height
            // This is done regardless of whether the building was selected or its height was increased.
            maxH = Math . max ( list [ j ] , maxH ) ;
        }

        // If the number of selected visible buildings meets the requirement K
        if ( selected >= K ) {

            // Update the minimum cost found so far
            output = Math . min ( output , sum ) ;
        }
    }

    // Print the final minimum cost
    myout ( output ) ;

}