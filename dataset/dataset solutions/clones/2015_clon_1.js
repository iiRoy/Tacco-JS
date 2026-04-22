/*
 * This is an extensively modified version of the original JavaScript code.
 * All functional logic remains precisely the same, adhering strictly to
 * the Type I clone definition.
 *
 * Changes are limited exclusively to:
 * - Whitespace (indentation, line breaks, spacing around operators and keywords)
 * - Comments (addition, removal, and modification of comment text)
 *
 * No identifiers, variable names, function names, operators, or expressions
 * have been altered in any way.
 */


// Begin setup for standard input/output operations.
// This section initializes the readline interface to handle console input.
var read = require( 'readline' ) . createInterface( {
    input: process . stdin,
    output: process . stdout
} ) ;


// Declare global variables that will store parsed input and the input handler object.
var obj ; // Object to manage input line processing.
var inLine = [ ] ; // Array to hold all input lines read from stdin.


// Event listener for each line of input received.
// Each line is pushed into the 'inLine' array.
read . on( 'line' , function ( input ) {
    inLine . push( input ) ;
} ) ;


// Event listener for when the input stream is closed.
// This marks the beginning of program execution after all input has been collected.
read . on( 'close' , function ( ) {

    // Initialize the input processing object using the collected lines.
    obj = init( inLine ) ;

    // Output a debug message indicating the start of the main processing logic.
    myerr( "-----start-----" ) ;

    // Record the starting time for performance measurement.
    var start = new Date( ) ;

    // Execute the core logic of the program.
    Main( ) ;

    // Calculate the elapsed time since the start.
    var end = new Date( ) - start ;

    // Output a debug message indicating the end of the main processing logic.
    myerr( "----- end -----" ) ;

    // Display the total execution time in milliseconds.
    myerr( "time : " + ( end ) + "ms" ) ;

    // Display the approximate memory usage (heapTotal) in kilobytes.
    myerr( "memory : " + Math . round( process . memoryUsage( ) . heapTotal / 1024 ) + "KB" ) ;

} ) ;


// --- Input Conversion Helper Functions ---
// These functions provide convenient ways to parse the next input token.

/**
 * Retrieves the next input token and converts it to an integer.
 * @returns {number} The next input token as an integer.
 */
function nextInt ( ) {
    return myconv( next( ) , 1 ) ;
}


/**
 * Retrieves the next input token and splits it into a string array by space.
 * @returns {string[]} An array of strings.
 */
function nextStrArray ( ) {
    return myconv( next( ) , 2 ) ;
}


/**
 * Retrieves the next input token, splits it by space, and converts elements to numbers.
 * @returns {number[]} An array of numbers.
 */
function nextIntArray ( ) {
    return myconv( next( ) , 4 ) ;
}


/**
 * Retrieves the next input token and splits it into a character array.
 * @returns {string[]} An array of characters.
 */
function nextCharArray ( ) {
    return myconv( next( ) , 6 ) ;
}


/**
 * Retrieves the very next raw input token from the processed input object.
 * This function directly calls the 'next' method of the global 'obj'.
 * @returns {string} The next raw input string.
 */
function next ( ) {
    return obj . next( ) ;
}


/**
 * Checks if there are more input tokens available to be read.
 * This function directly calls the 'hasNext' method of the global 'obj'.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasNext ( ) {
    return obj . hasNext( ) ;
}


/**
 * Initializes the input processing object from an array of input lines.
 * This object provides methods to check for and retrieve the next line of input.
 *
 * @param {string[]} input - An array of strings, where each string is a line of input.
 * @returns {object} An object with 'list', 'index', 'max', 'hasNext', and 'next' properties.
 */
function init ( input ) {
    var returnObj = {
        list : input , // The array containing all input lines.
        index : 0 , // Current index indicating the next line to read.
        max : input . length , // Total number of input lines.

        /**
         * Checks if there are more lines available to be read.
         * @returns {boolean} True if index is less than max, false otherwise.
         */
        hasNext : function ( ) {
            return ( this . index < this . max ) ;
        } ,

        /**
         * Retrieves the next line of input and advances the index.
         * Throws an error if no more input is available.
         * @returns {string} The next line from the input list.
         * @throws {string} "ArrayIndexOutOfBoundsException これ以上ないよ" if no more input.
         */
        next : function ( ) {
            if ( ! this . hasNext( ) ) {
                throw "ArrayIndexOutOfBoundsException これ以上ないよ" ;
            } else {
                var returnInput = this . list[ this . index ] ;
                this . index ++ ;
                return returnInput ;
            }
        }
    } ;

    // Return the fully constructed input handling object.
    return returnObj ;
}


/**
 * Outputs a given string to the standard console output.
 * This is a simple wrapper for console.log().
 *
 * @param {any} s - The value to be outputted.
 */
function myout ( s ) {
    console . log( s ) ;
}


/**
 * Outputs a debug message to the standard error console.
 * It uses Node.js's 'util.inspect' for detailed object logging.
 *
 * @param {any} s - The value to be debug-logged.
 */
function myerr ( s ) {
    console . error( "debug:" + require( "util" ) . inspect( s , false , null ) ) ;
}


/**
 * A versatile conversion function based on a numeric code.
 * It attempts various transformations on the input 'i' based on 'no'.
 *
 * @param {any} i - The input value to be converted.
 * @param {number} no - The conversion type code.
 *     1: Parse as integer.
 *     2: Split by space into string array.
 *     4: Split by space, map to numbers.
 *     6: Split by character into string array.
 *     7: Split by character, map to numbers.
 *     8: Join array elements with space.
 *     9: Join array elements with newline.
 *     0: Join array elements without separator.
 * @returns {any} The converted value or the original input if conversion fails or type code is unknown.
 */
function myconv ( i , no ) {
    try {
        switch ( no ) {
            case 1 :
                return parseInt( i ) ;
            case 2 :
                return i . split( " " ) ;
            case 4 :
                return i . split( " " ) . map( Number ) ;
            case 6 :
                return i . split( "" ) ;
            case 7 :
                return i . split( "" ) . map( Number ) ;
            case 8 :
                return i . join( " " ) ;
            case 9 :
                return i . join( "\n" ) ;
            case 0 :
                return i . join( "" ) ;
            default :
                return i ; // Return original input if 'no' is not recognized.
        }
    } catch ( e ) {
        return i ; // In case of any conversion error, return the original input.
    }
}


// --- Main Program Logic Starts Here ---
// This is the primary function where the problem-solving algorithm resides.
function Main ( ) {

    // Read the main integer N from input.
    var N = nextInt( ) ;

    // Get a list of divisors for N.
    var list = getDivisorList( N ) ;

    // Get a list of divisors for N - 1.
    var minusList = getDivisorList( N - 1 ) ;

    // Initialize a Set to store unique output values.
    var output = new Set( ) ;

    // Iterate through the divisors of (N - 1), skipping the first one (which is 1).
    // Add all these divisors to the output set.
    for ( var i = 1 ; i < minusList . length ; i ++ ) {
        output . add( minusList[ i ] ) ;
    }

    // Iterate through the divisors of N, skipping the first one (which is 1).
    for ( var i = 1 ; i < list . length ; i ++ ) {
        var tmpN = N ; // Temporary variable to manipulate N.

        // Perform a specific reduction process on tmpN using the current divisor.
        while ( tmpN >= list[ i ] ) {
            if ( tmpN % list[ i ] == 0 ) {
                tmpN /= list[ i ] ;
            } else {
                tmpN %= list[ i ] ;
            }
        }

        // If tmpN is reduced to 1, add the current divisor to the output set.
        if ( tmpN == 1 ) {
            output . add( list[ i ] ) ;
        }
    }

    // Output the final count of unique elements in the output set.
    myout( output . size ) ;
}


/**
 * Calculates and returns a sorted list of all positive divisors for a given value.
 * This function efficiently finds divisors by checking up to the square root of 'val'.
 *
 * @param {number} val - The number for which to find divisors.
 * @returns {number[]} A sorted array of unique positive divisors.
 */
function getDivisorList ( val ) {
    var list = [ ] ; // Initialize an empty array to store divisors.

    // Loop from 1 up to the square root of 'val'.
    for ( var i = 1 ; i * i <= val ; i ++ ) {
        // If 'i' divides 'val' evenly, then 'i' is a divisor.
        if ( val % i == 0 ) {
            list . push( i ) ; // Add 'i' to the list.

            // If 'i * i' is not equal to 'val', then 'val / i' is also a distinct divisor.
            if ( i * i != val ) {
                list . push( val / i ) ; // Add the corresponding pair divisor.
            }
        }
    }

    // Sort the list of divisors in ascending order.
    list . sort( function ( a , b ) {
        return a - b ;
    } ) ;

    // Return the sorted list of divisors.
    return list ;
}


/**
 * Determines if a given number is a prime number.
 * This function handles edge cases and uses an optimized loop for checking primality.
 *
 * @param {number} val - The number to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function isPrime ( val ) {
    // Handle trivial cases: null, <= 1, or even numbers (except 2).
    if ( val == null || val <= 1 || ( val != 2 && val % 2 == 0 ) ) {
        return false ;
    } else if ( val == 2 ) {
        return true ; // 2 is the only even prime number.
    }

    // Calculate the integer part of the square root of 'val'.
    // We only need to check for divisors up to this value.
    var root = Math . floor( Math . sqrt( val ) ) ;

    // Loop through odd numbers starting from 3 up to the square root.
    // If any odd number divides 'val' evenly, then 'val' is not prime.
    for ( var i = 3 ; i <= root ; i += 2 ) {
        if ( val % i == 0 ) {
            return false ;
        }
    }

    // If no divisors were found, the number is prime.
    return true ;
}


/**
 * Computes the prime factorization of a given number and returns it as a map.
 * The map keys are prime factors and values are their respective powers.
 *
 * @param {number} val - The number for which to find prime factors.
 * @returns {object} An object (map) where keys are prime factors and values are their counts.
 */
function getPrimeFactorization ( val ) {
    var primeMap = { } ; // Initialize an empty object to store prime factors and their counts.
    var div = 2 ; // Start checking for divisibility with the smallest prime, 2.

    // Continue as long as the value is not reduced to 1.
    while ( val != 1 ) {
        // If the current 'div' divides 'val' evenly.
        if ( val % div == 0 ) {
            // Increment the count for this prime factor in the map.
            // If it's a new factor, initialize its count to 1.
            ( primeMap[ div ] == null ) ? primeMap[ div ] = 1 : primeMap[ div ] ++ ;
            val /= div ; // Reduce 'val' by dividing it by the prime factor.

            // Optimization: If the remaining 'val' is itself a prime number,
            // it must be the last prime factor. Add it and break.
            if ( isPrime( val ) ) {
                ( primeMap[ val ] == null ) ? primeMap[ val ] = 1 : primeMap[ val ] ++ ;
                break ;
            }
        } else {
            // If 'div' does not divide 'val', move to the next potential prime factor.
            // If 'div' was 2, change to 3. Otherwise, increment by 2 to check only odd numbers.
            div = ( div == 2 ) ? div + 1 : div + 2 ;
        }
    }

    // Return the map containing prime factors and their counts.
    return primeMap ;
}


// --- End of Main Program Logic ---