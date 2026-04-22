/* This is a generated Type I clone of a JavaScript program.
 * The original code's functionality is preserved entirely.
 * Only whitespace and comments have been altered significantly.
 */

// First, we set up our input mechanism.
var input = require("fs") . readFileSync( "/dev/stdin" , "utf8" ) . trim() . split( "\n" ) ;


// This object will manage iterating through the input lines.
var obj = {
    // The 'list' property holds all the lines from the input.
    "list" : input ,
    // 'index' tracks the current position in the input list.
    "index" : 0 ,
    // 'max' stores the total number of input lines.
    "max" : input.length ,

    // The 'hasNext' method checks if there are more lines to read.
    "hasNext" : function ( ) {
        return ( this . index < this . max ) ;
    } ,

    // The 'next' method retrieves the next line from the input.
    "next" : function ( ) {
        // If there are no more lines, return an empty string.
        if ( ! this.hasNext ( ) ) {
            return "" ;
        }
        // Get the current line.
        var returnObj = this . list [ this . index ] ;
        // Advance the index for the next call.
        this.index ++ ;
        // Return the retrieved line.
        return returnObj ;
    }
} ;


// The main execution point of the program.
Main ( ) ;


// Helper function to get the next line from the input object.
function next ( ) {
    return obj . next ( ) ;
}


// Helper function to get the next line as an integer.
function nextInt ( ) {
    return myconv ( next ( ) , 1 ) ;
}


// Helper function to get the next line split by spaces into a string array.
function nextStrArray ( ) {
    return myconv ( next ( ) , 2 ) ; // Splits by half-width space.
}


// Helper function to get the next line split by spaces into an integer array.
function nextIntArray ( ) {
    return myconv ( next ( ) , 4 ) ; // Splits by half-width space and converts to numbers.
}


// Helper function to get the next line split by characters into a string array.
function nextCharArray ( ) {
    return myconv ( next ( ) , 6 ) ; // Splits into individual characters.
}


// Helper function to check if there are more lines available.
function hasNext ( ) {
    return obj . hasNext ( ) ;
}


// Standard output function. Logs to the console.
function myout ( t ) {
    console . log ( t ) ;
} // This function prints the given argument to standard output.


// Standard error output function. Logs to the error console.
function myerr ( t ) {
    console . error ( t ) ;
} // This function prints the given argument to standard error.


/*
 * This section describes the 'no' parameter for the myconv function.
 * It dictates how the input 'i' should be treated or converted.
 *
 * Cases:
 *  - Default: Returns the input 'i' as is, for unknown or abnormal values.
 *  - 1: Converts the input to an integer.
 *  - 2: Splits the input string by half-width spaces.
 *  - 4: Splits by half-width spaces and then maps each part to a number.
 *  - 6: Splits the input string into individual characters.
 *  - 7: Splits by characters and then maps each character to a number.
 *  - 8: Joins an array with half-width spaces.
 *  - 9: Joins an array with newlines.
 *  - 0: Joins an array without any separator.
 */
function myconv ( i , no ) {
    try {
        switch ( no ) {
            case 1 :
                return parseInt ( i ) ;
            case 2 :
                return i . split ( " " ) ;
            case 4 :
                return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
            case 6 :
                return i . split ( "" ) ;
            case 7 :
                return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
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
        // In case of any conversion error, return the original input.
        return i ;
    }
}


// The primary function where the main logic resides.
function Main ( ) {
    // Read an array of integers from the input.
    var one = nextIntArray ( ) ;
    // Perform a calculation: 1/one[0] + 1/one[1]
    var output = ( 1 / one [ 0 ] ) + ( 1 / one [ 1 ] ) ;
    // Output the reciprocal of the calculated sum.
    myout ( 1 / output ) ;
}