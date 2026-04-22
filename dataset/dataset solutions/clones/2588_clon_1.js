/*
 * This section contains boilerplate code for input/output handling.
 * It's generally not relevant to the core logic of the problem.
 * Feel free to ignore this part.
 */
var read = require('readline') . createInterface( {
    input: process . stdin ,
    output: process . stdout
} ); /*
     * 'read' is an instance of readline interface.
     */


var obj ;
var inLine = [ ] ;

read . on( 'line' , function ( input ) {
    inLine . push( input ) ;
} ) ;

read . on( 'close' , function ( ) {
    obj = init( inLine ) ;
    console . error( '\n↑入力 ↓出力' ) ; // Displaying input/output direction.
    Main( ) ; // Calling the main logic function.
} ) ;

/**
 * Creates a deep clone of an object or a Set.
 * @param {object|Set} obj - The object to clone.
 * @returns {object|Set} A deep clone of the input object.
 */
function makeClone( obj ) {
    return ( obj instanceof Set )
        ? new Set( Array . from( obj ) )
        : JSON . parse( JSON . stringify( obj ) ) ;
}

// Helper functions for parsing input values.
function nextInt( ) {
    return myconv( next( ) , 1 ) ;
}

function nextStrArray( ) {
    return myconv( next( ) , 2 ) ;
}

function nextIntArray( ) {
    return myconv( next( ) , 4 ) ;
}

function nextCharArray( ) {
    return myconv( next( ) , 6 ) ;
}

function next( ) {
    return obj . next( ) ;
}

function hasNext( ) {
    return obj . hasNext( ) ;
}

/*
 * Initializes the input reader object.
 * This function processes the array of input lines.
 * It provides methods to check for more input and retrieve the next line.
 */
function init( input ) {
    return {
        list : input ,
        index : 0 , // Current position in the input list.
        max : input . length ,

        hasNext : function ( ) {
            return ( this . index < this . max ) ;
        } ,

        next : function ( ) {
            if ( this . hasNext( ) ) {
                return this . list [ this . index ++ ] ;
            } else {
                throw 'ArrayIndexOutOfBoundsException ‚There is no more input' ;
            }
        }
    } ;
}

function myout( s ) {
    console . log( s ) ;
}

function myerr( s ) {
    console . error( 'debug:' + require( 'util' ) . inspect( s , false , null ) ) ;
}

/*
 * This function is responsible for converting input strings based on a specified type.
 * The 'no' parameter determines the conversion method.
 *
 * Param 'no' values:
 * ----------------------------------------------------------------------------------
 *  1: Parses the input string as an integer (parseInt).
 *  2: Splits the input string by spaces into an array of strings.
 *  4: Splits the input string by spaces and converts each part to a number (map(Number)).
 *  6: Splits the input string into an array of individual characters.
 *  7: Splits the input string into characters and converts each to a number.
 *  8: Joins an array of strings with spaces.
 *  9: Joins an array of strings with newlines.
 *  0: Joins an array of strings without any separator.
 * Default: Returns the input 'i' as is, if 'no' is unknown or an outlier.
 * ----------------------------------------------------------------------------------
 */
function myconv( i , no ) {
    try {
        switch ( no ) {
            case 1 :
                return parseInt( i ) ;
            case 2 :
                return i . split( ' ' ) ;
            case 4 :
                return i . split( ' ' ) . map( Number ) ;
            case 6 :
                return i . split( '' ) ;
            case 7 :
                return i . split( '' ) . map( Number ) ;
            case 8 :
                return i . join( ' ' ) ;
            case 9 :
                return i . join( '\n' ) ;
            case 0 :
                return i . join( '' ) ;
            default :
                return i ;
        }
    } catch ( e ) {
        /* If any error occurs during conversion,
         * simply return the original input 'i'. */
        return i ;
    }
}

/*
 * End of utility functions and input processing setup.
 * The main problem-solving logic begins here.
 */

/*
 * Main function where the primary logic of the program resides.
 * This function processes the input according to the problem's requirements.
 */
function Main( ) {
    /* Read the integer N, which might represent the number of iterations or elements. */
    var N = nextInt( ) ;

    /* Read a list of integers from the input. */
    var list = nextIntArray( ) ;

    /* Sort the 'list' array in ascending order. */
    list . sort( function ( a , b ) {
        return a - b ; // Standard ascending sort.
    } ) ;

    /* Initialize an array 'check'. */
    var check = [ ] ;
    /* Pop the largest element from 'list' (since it's sorted ascending)
     * and add it to 'check'. */
    check . push( list . pop( ) ) ;

    /* Loop N times, as determined by the input N. */
    for ( var i = 0 ; i < N ; i ++ ) {
        /* Initialize a temporary array 'check2' for each iteration. */
        var check2 = [ ] ;
        /* The inner loop runs (1 << i) times, which is equivalent to 2^i. */
        for ( var j = 0 ; j < ( 1 << i ) ; j ++ ) {
            /* Pop elements from 'list' and add them to 'check2'.
             * Since 'list' is sorted ascending, pop() retrieves the largest remaining. */
            check2 . push( list . pop( ) ) ;
        }

        /* Sort 'check2' in descending order. */
        check2 . sort( function ( a , b ) {
            return b - a ; // Descending sort.
        } ) ;

        /* Sort 'check' in descending order. */
        check . sort( function ( a , b ) {
            return b - a ; // Descending sort.
        } ) ;

        // The following lines were commented out in the original code,
        // so they remain commented here, but with different formatting.
        // myerr(check);
        // myerr(check2);

        /* Compare elements from 'check' and 'check2'. */
        for ( var j = 0 ; j < check2 . length ; j ++ ) {
            /* If an element in 'check' is less than or equal to the corresponding
             * element in 'check2', the condition is not met. */
            if ( check [ j ] <= check2 [ j ] ) {
                myout( "No" ) ; // Output "No" and terminate.
                return ;
            }
        }
        /* If all comparisons pass, concatenate 'check2' to 'check'. */
        check = check . concat( check2 ) ;
    }

    /* After the loop completes without returning "No",
     * output the final state of the 'check' array for debugging. */
    myerr( check ) ;
    /* If all conditions are met throughout the process, output "Yes". */
    myout( "Yes" ) ;
}