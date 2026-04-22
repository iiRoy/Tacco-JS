/*
 * This script processes input from standard input, performs calculations,
 * and outputs a result to standard output.
 * It's designed for competitive programming environments.
 */

// Global variable to handle input stream parsing.
var   input = require("fs") . readFileSync( "/dev/stdin" , "utf8" ) . trim() . split("\n") ;

/*
 * An object acting as an iterator for the input lines.
 * It provides methods to check for the next element and retrieve it.
 */
var obj = {
     "list" : input, // Stores the array of input lines.
     "index" : 0,    // Current position in the input array.
     "max" : input.length, // Total number of input lines.

     /**
      * Checks if there are more elements available in the input list.
      * @returns {boolean} True if there's a next element, false otherwise.
      */
     "hasNext" : function ( ) {
         return (this.index < this.max) ;
     } ,

     /**
      * Retrieves the next element from the input list and advances the index.
      * Throws an error if no more elements are available.
      * @returns {string} The next input line.
      */
     "next" : function ( ) {
         if ( ! this.hasNext ( ) ) {
             throw "NoSuchElementException:次に要素は無いよ" ; // Original Japanese error message retained.
         }
         var returnObj = this.list[this.index] ; // Get the current element.
         this.index ++ ; // Increment the index for the next call.
         return returnObj ; // Return the fetched element.
     }
} ;

// Immediately invoke the main function to start program execution.
Main ( ) ;

/**
 * Wrapper function to get the next input line using the global iterator.
 * @returns {string} The next input line as a string.
 */
function next ( ) {
    return obj . next ( ) ;
}

/**
 * Retrieves the next input line and converts it to an integer.
 * @returns {number} The next input line parsed as an integer.
 */
function nextInt ( ) {
    return myconv ( next ( ) , 1 ) ;
}

/**
 * Retrieves the next input line and splits it by spaces into a string array.
 * @returns {string[]} An array of strings.
 */
function nextStrArray ( ) {
    return myconv ( next ( ) , 2 ) ; /* This comment was originally "半角スペース分割".
                                       Now it's just a general description. */
}

/**
 * Retrieves the next input line, splits it by spaces, and converts elements to numbers.
 * @returns {number[]} An array of numbers.
 */
function nextIntArray ( ) {
    return myconv ( next ( ) , 4 ) ; // Converts space-separated values to numbers.
}

/**
 * Retrieves the next input line and splits it into an array of characters.
 * @returns {string[]} An array of single-character strings.
 */
function nextCharArray ( ) {
    return myconv ( next ( ) , 6 ) ; // Splits the input string into individual characters.
}

/**
 * Checks if there are more input lines available.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasNext ( ) {
    return obj . hasNext ( ) ;
}

/**
 * Outputs a given value to the standard output (console).
 * @param {*} t The value to be printed.
 */
function myout ( t ) {
    console . log ( t ) ; // Uses console.log for standard output.
}

/**
 * Outputs a given value to the standard error output.
 * @param {*} t The value to be printed.
 */
function myerr ( t ) {
    console . error ( t ) ; /* This function directs messages to the error stream. */
}

/*
 * myconv function: Handles various conversions based on the 'no' parameter.
 * Original comments for myconv parameters:
 * [no]要素の扱い。数値型
 * 不明値、異常時:引数そのまま返す　1:数値へ変換
 * 2:半角SPで分割 4:半角SPで分割し、数値配列へ
 * 6:1文字で分割  7:1文字で分割し、数値配列へ
 * 8:半角SPで結合 9:改行で結合 0:文字なしで結合
 */
/**
 * A utility function to convert or process input `i` based on the `no` parameter.
 * @param {*} i The input to be converted.
 * @param {number} no The conversion type identifier.
 * @returns {*} The converted or processed value, or the original input if conversion fails or `no` is unknown.
 */
function myconv ( i , no ) {
    try {
        switch ( no ) {
            case 1 : return parseInt ( i ) ; // Convert to integer.
            case 2 : return i . split ( " " ) ; // Split by space.
            case 4 : return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ; // Split by space and convert to numbers.
            case 6 : return i . split ( "" ) ; // Split by character.
            case 7 : return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ; // Split by character and convert to numbers.
            case 8 : return i . join ( " " ) ; // Join array elements with spaces.
            case 9 : return i . join ( "\n" ) ; // Join array elements with newlines.
            case 0 : return i . join ( "" ) ; // Join array elements without a separator.
            default : return i ; // Return original input if 'no' is not recognized.
        }
    }
    catch ( e ) {
        return i ; // In case of any conversion error, return the original input.
    }
}

/**
 * The main execution function of the program.
 * It reads N, two lists aList and bList, then performs calculations
 * to determine if a condition based on these lists is met.
 */
function Main ( ) {
    var N = nextInt ( ) ; // Read the first integer, N.
    var aList = nextIntArray ( ) ; // Read the first array of integers.
    var bList = nextIntArray ( ) ; // Read the second array of integers.

    /* These variables appear to be unused in the current logic,
     * but are kept as per Type I clone requirements. */
    var aSum = 0 ;
    var bSum = 0 ;

    var count = 0 ; // This variable tracks the difference to satisfy the condition.
                    // Original comment: "a > bの箇所を埋める" (fill places where a > b)

    // First loop: Process cases where aList[i] < bList[i].
    for ( var i = 0 ; i < N ; i ++ ) {
        if ( aList [ i ] < bList [ i ] ) {
            // If a[i] is less than b[i], we need to increase 'count'.
            // The amount added is bList[i] - floor(aList[i] / 2).
            // Original comment: "偶奇が不一致なら、countに足す数値は1少ない" (If parity doesn't match, the number added to count is 1 less)
            count += Math . floor ( bList [ i ] - aList [ i ] / 2 ) ;
        }
    }

    // Second loop: Process cases where aList[i] > bList[i].
    for ( var i = 0 ; i < N ; i ++ ) {
        if ( aList [ i ] > bList [ i ] ) {
            // If a[i] is greater than b[i], we need to decrease 'count'.
            // The amount subtracted is the direct difference.
            count -= aList [ i ] - bList [ i ] ;
        }
    }

    // Final condition check and output.
    if ( count >= 0 ) {
        myout ( "Yes" ) ; // Output "Yes" if count is non-negative.
    } else {
        myout ( "No" ) ; // Output "No" otherwise.
    }
}