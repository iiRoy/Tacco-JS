"use strict" ; /* Enable strict mode for cleaner code and error prevention */


/*
 * This immediately invoked function expression (IIFE)
 * creates a utility for parsing input data.
 * It's designed to read various data types from a string.
 */
var GET = ( function ( ) {

    /**
     * The main entry point for the GET utility.
     * @param {string} s - The raw input string, typically read from a file.
     * @returns {g} A new instance of the internal parser object.
     */
    function f ( s ) {
        return new g ( s ) ;
    }

    /**
     * Constructor for the internal parser object.
     * It processes the input string into lines and initializes a line pointer.
     * @param {string} s - The raw input string.
     */
    function g ( s ) {
        // Trim whitespace from the string and split it into an array of lines.
        this . _s = s . trim ( ) . split ( "\n" ) ;
        // Initialize the current line index to 0.
        this . _y = 0 ;
    }

    /**
     * Prototype method 'a' (atom) for reading a single value from the current line.
     * It reads values from right to left on a line.
     * @param {boolean} f - If true, return the value as a string; otherwise, parse as a number.
     * @returns {string|number} The parsed value.
     */
    g . prototype . a = function ( f ) {
        var s = this . _s , // Reference to the array of lines
            y = this . _y , // Current line index
            r ;             // Variable to hold the result

        // If the current line hasn't been split into individual items yet, do so.
        // Also, reverse the array so that 'pop' reads from the beginning of the original line.
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
        }

        // Pop the last element (which is the first element of the original line)
        r = s [ y ] . pop ( ) ;

        // If the current line is now empty, advance to the next line.
        if ( ! s [ y ] . length ) {
            this . _y ++ ;
        }

        // Return the result, either as a string or a number.
        return f ? r : + r ;
    } ;

    /**
     * Prototype method 'l' (line) for reading an entire line of values.
     * @param {boolean} f - If true, return values as strings; otherwise, parse as numbers.
     * @returns {Array<string|number>} An array of parsed values from the line.
     */
    g . prototype . l = function ( f ) {
        // Get the current line, split it by spaces, and advance to the next line.
        var s = this . _s [ this . _y ++ ] . split ( " " ) ;

        // Return the array, optionally mapping all elements to numbers.
        return f ? s : s . map ( a => + a ) ;
    } ;

    /**
     * Prototype method 'm' (matrix) for reading multiple lines, each as an array of values.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, return values as strings; otherwise, parse as numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of parsed values.
     */
    g . prototype . m = function ( n , f ) {
        // Slice 'n' lines from the input, advance the line pointer, and split each line by spaces.
        var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

        // Return the matrix, optionally mapping all inner elements to numbers.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;

    /**
     * Prototype method 'r' (raw lines) for reading multiple lines as raw strings or numbers.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, return lines as raw strings; otherwise, parse each line as a single number.
     * @returns {Array<string|number>} An array of raw lines or numbers.
     */
    g . prototype . r = function ( n , f ) {
        // Slice 'n' lines from the input and advance the line pointer.
        var r = this . _s . slice ( this . _y , this . _y += n ) ;

        // Return the array, optionally mapping each element to a number.
        return f ? r : r . map ( a => + a ) ;
    } ;

    // Return the public interface function 'f'.
    return f ;

} ) ( ) ;


// Initialize the input parser 'o' by reading from standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/**
 * Dynamically creates a multi-dimensional array filled with a default value.
 * This function uses 'eval' and is generally considered unsafe for untrusted input.
 *
 * @param {*} v - The initial value to fill the innermost array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., xArray(0, 2, 3) for a 2x3 array).
 * @returns {Array} A multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments , // All arguments passed to the function
        l = a . length , // Number of arguments
        // Start building the 'eval' string for the innermost array.
        r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ;

    // Loop backwards through dimensions to build nested array creation.
    while ( -- l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    // Evaluate the constructed string to create the array.
    return eval ( r ) ;
}


// Define a large number to represent infinity, often used in algorithms.
var INF = 1e15 ;


// Execute the main logic and print its result to the console.
console . log ( main ( ) ) ;


/**
 * The main function containing the core logic of the program.
 * It processes input to determine certain counts and then calculates
 * a series of values based on those counts.
 *
 * @returns {string} The final calculated answer, joined by newlines.
 */
function main ( ) {

    // Read the first number from input, which is 'n'.
    var n = o . a ( ) ;

    // Read the next line of numbers into array 'a'.
    var a = o . l ( ) ;

    // Create a 1D array (acting as a frequency map) of size 'n', initialized with zeros.
    // This will store the frequency of each number in 'a'.
    var map = xArray ( 0 , n ) ;

    /*
     * Populate the frequency map.
     * For each number 'a[i]' in the input array,
     * increment the count at the corresponding index in 'map'.
     * Note: Input numbers are 1-based, so we subtract 1 for 0-based indexing.
     */
    for ( var i = 0 ; i < n ; i ++ ) {
        map [ a [ i ] - 1 ] ++ ;
    }

    // Initialize an empty array to store non-zero frequencies.
    var set = [ ] ;

    /*
     * Iterate through the frequency map 'map'.
     * If a count is greater than zero, add it to the 'set' array.
     * 'set' will contain the distinct frequencies of numbers present in 'a'.
     */
    for ( var i = 0 ; i < n ; i ++ ) {
        if ( map [ i ] ) {
            set . push ( map [ i ] ) ;
        }
    }

    // Sort the 'set' array in descending order.
    // This arranges the frequencies from largest to smallest.
    set . sort ( ( a , b ) => b - a ) ;

    // Initialize an array 'sum' to store prefix sums of the sorted 'set'.
    // The size is set.length + 1 for easier 1-based indexing for sums.
    var sum = Array ( set . length + 1 ) ;
    sum [ 0 ] = 0 ; // The 0-th prefix sum is 0.

    /*
     * Calculate prefix sums.
     * sum[i] will store the sum of the 'i' smallest frequencies from 'set'.
     * We access elements from 'set' in reverse order (set.length - i) to get the smallest ones first.
     */
    for ( var i = 1 ; i <= set . length ; i ++ ) {
        sum [ i ] = sum [ i - 1 ] + set [ set . length - i ] ;
    }

    // Initialize the 'ans' array. The first element is 'n'.
    var ans = [ n ] ;

    /*
     * Calculate the remaining elements of 'ans'.
     * This loop iterates from 'i = 2' up to 'n'.
     * 'i' represents a group size or a divisor.
     */
    for ( var i = 2 ; i <= n ; i ++ ) {
        // If the number of distinct frequencies is less than 'i',
        // it's impossible to form 'i' groups, so the answer is 0.
        if ( set . length < i ) {
            ans . push ( 0 ) ;
        }
        else {
            /*
             * Calculate 'mx' (maximum possible value for the current 'i').
             * 'mx' is the minimum of two values:
             * 1. The total count 'n' divided by 'i' (integer division).
             *    This represents the maximum possible average value per group.
             * 2. The sum of the 'i' smallest frequencies (from the 'sum' array).
             *    This represents the total count if we only consider 'i' distinct frequencies.
             */
            var mx = Math . min ( ( n / i ) | 0 , sum [ set . length - i + 1 ] ) ;
            ans . push ( mx ) ;
        }
    }

    // Join the elements of the 'ans' array with newline characters and return the result.
    return ans . join ( "\n" ) ;
}