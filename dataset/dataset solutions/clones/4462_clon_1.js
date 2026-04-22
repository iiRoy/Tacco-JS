/*
 * This is a Type I clone of a JavaScript program.
 * The original logic and structure are preserved.
 * Only whitespace and comments have been altered significantly.
 */
var input = require(  "fs"  ) . readFileSync ( "/dev/stdin" ,   "utf8" ) . trim ( ) . split ( "\n"  ) ;

// Custom object for iterating over input lines
var obj = {
    "list"  :  input ,
    "index" : 0   ,
    "max"   : input.length ,

    // Checks if there are more elements in the list
    "hasNext" : function ( ) {
        return ( this.index < this.max ) ;
    } ,

    // Retrieves the next element from the list
    "next" : function ( ) {
        if ( ! this.hasNext ( ) ) {
            throw "NoSuchElementException:次に要素は無いよ" ; // Error message in Japanese
        }
        var returnObj = this.list[ this.index ] ;
        this.index ++ ;
        return returnObj ;
    }
} ;

// Execute the main program logic
Main ( ) ;


/**
 * Helper function to get the next item from the custom iterator.
 * @returns {string} The next line from input.
 */
function next ( ) {
    return obj.next ( ) ;
}

// Retrieves the next item as an integer.
function nextInt ( ) {
    return myconv ( next ( ) , 1 ) ;
}

/*
 * Retrieves the next item as a string array, split by space.
 */
function nextStrArray ( ) {
    return myconv ( next ( ) , 2 ) ;
}

// Retrieves the next item as an integer array, split by space.
function nextIntArray ( ) {
    return myconv ( next ( ) , 4 ) ;
}

// Retrieves the next item as a character array.
function nextCharArray ( ) {
    return myconv ( next ( ) , 6 ) ;
}

// Checks if there are more items in the input.
function hasNext ( ) {
    return obj.hasNext ( ) ;
}

// Prints to standard output.
function myout ( t ) {
    console.log ( t ) ;
}

// Prints to standard error output.
function myerr ( t ) {
    console.error ( t ) ;
}

/*
 * This function handles various conversions for input data.
 * The 'no' parameter specifies the type of conversion.
 *
 * Conversion types:
 *   - default: Returns the input as is.
 *   - 1: Parses input to an integer.
 *   - 2: Splits input by spaces into a string array.
 *   - 4: Splits input by spaces and converts elements to numbers, returning an array of numbers.
 *   - 6: Splits input into a character array.
 *   - 7: Splits input into a character array and converts elements to numbers.
 *   - 8: Joins an array with spaces.
 *   - 9: Joins an array with newlines.
 *   - 0: Joins an array without any separator.
 */
function myconv ( i , no ) {
    try {
        switch ( no ) {
            case 1 :
                return parseInt ( i ) ;
            case 2 :
                return i.split ( " " ) ;
            case 4 :
                return i.split ( " " ) . map ( ( a ) => Number ( a ) ) ;
            case 6 :
                return i.split ( "" ) ;
            case 7 :
                return i.split ( "" ) . map ( ( a ) => Number ( a ) ) ;
            case 8 :
                return i.join ( " " ) ;
            case 9 :
                return i.join ( "\n" ) ;
            case 0 :
                return i.join ( "" ) ;
            default :
                return i ;
        }
    } catch ( e ) {
        return i ; // In case of error, return original input
    }
}


/*
 * The main function containing the core logic of the program.
 * It reads input, processes it, and determines a "POSSIBLE" or "IMPOSSIBLE" outcome.
 */
function Main ( ) {
    var one = nextIntArray ( ) ; // Read the first line as an array of integers.

    var N = one[ 0 ] ; // First element of the array.
    var M = one[ 1 ] ; // Second element of the array.


    var fromOne = new Set ( ) ; // Set to store nodes reachable from node 1.
    var toN     = new Set ( ) ; // Set to store nodes that can reach node N.

    // Loop through M lines of input.
    for ( var i = 0 ; i < M ; i ++ ) {
        var tmp = nextIntArray ( ) ; // Read an edge.

        // Check if the current edge starts from node 1.
        if ( tmp[ 0 ] == 1 ) {
            fromOne.add ( tmp[ 1 ] ) ; // Add the destination node to 'fromOne' set.
        }

        // Check if the current edge ends at node N.
        if ( tmp[ 1 ] == N ) {
            toN.add ( tmp[ 0 ] ) ; // Add the source node to 'toN' set.
        }
    }

    // Output debug information to standard error.
    myerr ( fromOne ) ;
    myerr ( toN ) ;

    var toNlist = Array.from ( toN ) ; // Convert 'toN' set to an array for iteration.

    // Iterate through elements in 'toNlist'.
    for ( var i = 0 ; i < toNlist.length ; i ++ ) {
        // Check if an element in 'toNlist' is also present in 'fromOne' set.
        if ( fromOne.has ( toNlist[ i ] ) ) {
            myout ( "POSSIBLE" ) ; // If found, output "POSSIBLE".
            return ; // Exit the function.
        }
    }

    myout ( "IMPOSSIBLE" ) ; // If no such common element is found, output "IMPOSSIBLE".
}