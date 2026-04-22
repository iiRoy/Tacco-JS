/*
 * This is the GET module, designed to parse input data.
 * It provides methods for reading various data types from a string array.
 */
var GET = (function ( ) {

    // Internal helper function to create a new G instance.
    function f ( s ) {
        return new g ( s ) ;
    }

    /*
     * G constructor: Initializes the input string array.
     * @param {string} s - The raw input string.
     */
    function g ( s ) {
        // Store the lines after trimming whitespace and splitting by newline.
        this._s = s . trim ( ) . split ( "\n" ) ;
        // Initialize the current line index to 0.
        this._y = 0 ;
    }


    /*
     * Reads a single value from the current line, treating the line as a stack.
     * If 'f' is true, returns the value as a string; otherwise, as a number.
     * @param {boolean} f - Flag to return as string (true) or number (false).
     * @returns {string|number} The parsed value.
     */
    g . prototype . a = function ( f ) {
        var s = this._s , // Reference to the string array.
            y = this._y , // Current line index.
            r ;           // Variable to hold the result.

        // If the current line hasn't been processed into a reversed array yet, do it.
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
        }

        // Pop the last element (which was the first in original order due to reverse).
        r = s [ y ] . pop ( ) ;

        // If the current line is now empty, advance to the next line.
        if ( ! s [ y ] . length ) {
            this._y ++ ;
        }

        // Return the result, converting to number if 'f' is falsy.
        return f ? r : + r ;
    } ;


    /**
     * Reads an entire line as an array of values.
     * Advances the line pointer.
     * @param {boolean} f - Flag to return as strings (true) or numbers (false).
     * @returns {Array<string|number>} An array of parsed values.
     */
    g . prototype . l = function ( f ) {
        // Split the current line by space and then advance the line pointer.
        var s = this._s [ this._y ++ ] . split ( " " ) ;

        // Return as strings or map to numbers.
        return f ? s : s . map ( a => + a ) ;
    } ;

    /**
     * Reads multiple lines as a 2D array (matrix).
     * Advances the line pointer by 'n' lines.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - Flag to return as strings (true) or numbers (false).
     * @returns {Array<Array<string|number>>} A 2D array of parsed values.
     */
    g . prototype . m = function ( n , f ) {
        // Slice 'n' lines, advance pointer, and map each line to an array of strings.
        var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

        // Return as strings or map all nested elements to numbers.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;

    /**
     * Reads multiple lines as a 1D array.
     * Advances the line pointer by 'n' lines.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - Flag to return as strings (true) or numbers (false).
     * @returns {Array<string|number>} An array of parsed values.
     */
    g . prototype . r = function ( n , f ) {
        // Slice 'n' lines and advance the pointer.
        var r = this._s . slice ( this._y , this._y += n ) ;

        // Return as strings or map to numbers.
        return f ? r : r . map ( a => + a ) ;
    } ;

    // The IIFE returns the 'f' function, which is the public interface to GET.
    return f ;

}) ( ) ; // End of the GET module IIFE.


// Initialize the input reader 'o' by reading from standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 * Helper function to create multi-dimensional arrays,
 * similar to `new Array(dim1).fill(0).map(() => new Array(dim2)...)`.
 * It dynamically constructs and evaluates a string representing the array creation.
 * @param {*} v - The initial value for the innermost array elements.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} A multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments , // All arguments passed to the function.
        l = a . length ,  // Total number of arguments.
        r = "Array(a[" + ( -- l ) + "]).fill(0).map(x=>{return " + v + ";})" ; // Innermost array creation.

    // Loop to build up the nested array creation string.
    while ( -- l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    // Evaluate the constructed string to create the array.
    return eval ( r ) ;
}


// Execute the main logic and print its result to the console.
console . log ( main ( ) ) ;


/**
 * The main function containing the core logic of the program.
 * It reads input, performs calculations, and returns a result.
 * @returns {number} The calculated result.
 */
function main ( ) {
    // Read two integers 'n' and 'k' from the input.
    var n = o . a ( ) ;
    var k = o . a ( ) ;

    // Read an array 'a' of numbers from the input.
    var a = o . l ( ) ;

    // Calculate the sum of all elements in array 'a'.
    var s = a . reduce ( ( a , b ) => a + b ) ;

    // Find all divisors of 's' and store them in descending order.
    var div = f ( s ) ;

    // Iterate through the divisors.
    for ( var i = 0 ; i < div . length ; i ++ ) {
        // Calculate remainders of elements in 'a' when divided by the current divisor.
        // Then sort these remainders in ascending order.
        var x = a . map ( a => a % div [ i ] ) . sort ( ( a , b ) => a - b ) ;

        // Initialize variables for the inner loop.
        var y = n ;        // 'y' acts as a pointer for the end of the 'x' array (for larger remainders).
        var sum = 0 ,      // Current sum of remainders being processed.
            mx = 0 ;       // Maximum value accumulated, should not exceed 'k'.

        // Inner loop: Iterate through the sorted remainders.
        // Stop if 'j' reaches 'y' or 'mx' exceeds 'k'.
        for ( var j = 0 ; j < y && mx <= k ; j ++ ) {
            // Add the current remainder to 'sum' and 'mx'.
            sum += x [ j ] ;
            mx += x [ j ] ;

            // While 'sum' is positive, try to "balance" it by removing larger remainders
            // from the end of the 'x' array, effectively making them "full" by adding
            // (div[i] - x[y-1]) cost.
            while ( sum > 0 ) {
                sum -= div [ i ] - x [ -- y ] ;
            }
        }

        // If 'mx' (the total cost) did not exceed 'k', then this divisor is a valid solution.
        if ( mx <= k ) {
            return div [ i ] ;
        }
    }

    // If no suitable divisor is found, return 1 as a default or fallback.
    return 1 ;
}


/*
 * Calculates all divisors of a given number 'n' and returns them in descending order.
 * This function is distinct from the 'f' inside the GET module.
 * @param {number} n - The number for which to find divisors.
 * @returns {Array<number>} An array of divisors, sorted descending.
 */
function f ( n ) {
    var r = [ n ] ; // Initialize with 'n' itself (always a divisor).

    // Calculate the square root of 'n'.
    var m = Math . sqrt ( n ) ;

    // Get the integer part of the square root.
    var x = m | 0 ;

    // If 'n' is a perfect square, add its square root as a divisor.
    if ( x * x === n ) {
        r . push ( x ) ;
    }

    // Iterate from 2 up to (but not including) the square root.
    for ( var i = 2 ; i < m ; i ++ ) {
        // If 'i' divides 'n' evenly, then 'i' and 'n/i' are both divisors.
        if ( n % i === 0 ) {
            r . push ( i , n / i ) ;
        }
    }

    // Sort the divisors in descending order.
    return r . sort ( ( a , b ) => b - a ) ;
}