var GET = (
    function () {

        /**
         * The main entry point for the GET utility.
         * Creates a new instance of the internal data structure `g`.
         * @param {string} s - The input string to be processed.
         * @returns {g} A new instance of the data parser.
         */
        function f ( s ) {

            return new g ( s ) ;

        }

        /**
         * Internal class `g` for parsing input data.
         * It stores the input as an array of lines and maintains a pointer to the current line.
         * @param {string} s - The raw input string.
         */
        function g ( s ) {

            // Trim whitespace from the input and split it into an array of lines.
            this._s = s . trim ( ) . split ( "\n" ) ;

            // Initialize the line pointer (y-coordinate) to the first line.
            this._y = 0 ;

        }

        /**
         * Prototype method 'a' (presumably 'atom' or 'advance').
         * Reads and processes the next 'atom' or number from the current line.
         * If the line is exhausted, it moves to the next line.
         * @param {boolean} f - If true, returns the value as a string; otherwise, as a number.
         * @returns {*} The parsed value (string or number).
         */
        g . prototype . a = function ( f ) {

            // Get the current array of lines and the current line index.
            var s = this . _s ,
                y = this . _y ,
                r ; // Variable to hold the result.


            // If the current line hasn't been processed into an array of words yet,
            // process it: split by space and reverse to use pop efficiently.
            if ( typeof s [ y ] === "string" ) {

                s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;

            }

            // Pop the last element (which is the first word after reversing) from the current line.
            r = s [ y ] . pop ( ) ;

            // If the current line is now empty, advance to the next line.
            if ( ! s [ y ] . length ) {

                this . _y ++ ;

            }


            // Return the result, either as a string or converted to a number.
            return f ? r : + r ;

        } ;

        /**
         * Prototype method 'l' (presumably 'line').
         * Reads and processes an entire line of numbers.
         * @param {boolean} f - If true, returns an array of strings; otherwise, an array of numbers.
         * @returns {Array<string|number>} An array of parsed values from the line.
         */
        g . prototype . l = function ( f ) {

            // Get the current line, split it by spaces, and then increment the line pointer.
            var s = this . _s [ this . _y ++ ] . split ( " " ) ;

            // Return the array, either as strings or mapped to numbers.
            return f ? s : s . map ( a => + a ) ;

        } ;

        /**
         * Prototype method 'm' (presumably 'matrix').
         * Reads and processes 'n' lines as a matrix of numbers.
         * @param {number} n - The number of lines to read.
         * @param {boolean} f - If true, returns a matrix of strings; otherwise, a matrix of numbers.
         * @returns {Array<Array<string|number>>} A 2D array (matrix) of parsed values.
         */
        g . prototype . m = function ( n , f ) {

            // Slice 'n' lines, parse each into an array of words.
            var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

            // Return the matrix, either as strings or mapped to numbers.
            return f ? r : r . map ( a => a . map ( a => + a ) ) ;

        } ;

        /**
         * Prototype method 'r' (presumably 'rows' or 'raw').
         * Reads and processes 'n' raw lines.
         * @param {number} n - The number of lines to read.
         * @param {boolean} f - If true, returns an array of strings; otherwise, an array of numbers.
         * @returns {Array<string|number>} An array of parsed values from the lines.
         */
        g . prototype . r = function ( n , f ) {

            // Slice 'n' lines directly.
            var r = this . _s . slice ( this . _y , this . _y += n ) ;

            // Return the array, either as strings or mapped to numbers.
            return f ? r : r . map ( a => + a ) ;

        } ;

        // The IIFE returns the 'f' function, which is the public interface for GET.
        return f ;

    }
) ( ) ;

// Initialize the data parser 'o' by reading from standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/**
 * Performs a binary search to find the lower bound of a value in a sorted array.
 * This implementation is slightly unusual, using a specific loop condition and ternary operators.
 * @param {Array<number>} d - The sorted array to search within.
 * @param {number} a - The starting index of the search range.
 * @param {number} b - The ending index (exclusive) of the search range.
 * @param {number} e - The value to search for.
 * @returns {number} The index of the first element not less than 'e', or 'b' if all elements are less than 'e'.
 */
function lower_bound ( d , a , b , e ) {

    for (
        var c ; // Declare a variable 'c' for the midpoint index.
        1 < b - a ; // Loop while the search range has more than one element.
    ) {

        // Calculate the midpoint index using bitwise OR for floor.
        c = 0 | ( a + b ) / 2 ;

        // If the element at midpoint is less than 'e', move the lower bound 'a' to 'c'.
        // Otherwise, move the upper bound 'b' to 'c'.
        d [ c ] < e ? a = c : b = c ;

    }

    // After the loop, 'a' and 'b' will be adjacent.
    // Check 'd[a]' to determine the final lower bound index.
    return d [ a ] < e ? b : a ;

} ;


// Execute the main logic and print the result to the console.
console . log ( main ( ) ) ;


/**
 * The main function that orchestrates the problem-solving logic.
 * It processes input arrays 'a' and 'b' to calculate a specific result 'ans'.
 * This function involves bitwise operations, sorting, and helper functions.
 * @returns {number} The final calculated answer.
 */
function main ( ) {

    // Read the first integer 'n' from the input.
    var n = o . a ( ) ;

    // Read the first array 'a' from the input.
    var a = o . l ( ) ;

    // Read the second array 'b' from the input.
    var b = o . l ( ) ;

    // Initialize the answer variable.
    var ans = 0 ;

    // Sort array 'b' in ascending order.
    b . sort ( ( a , b ) => a - b ) ;

    // Iterate from bit 28 down to 0.
    for ( var i = 28 ; i >= 0 ; i -- ) {

        // Calculate bit-related constants for the current iteration.
        var t  = 1 << i ;          // Current power of 2.
        var t2 = t * 2 ;           // Double the current power of 2.
        var t3 = t * 3 ;           // Triple the current power of 2.
        var c  = t - 1 ;           // Mask for current bit and lower.
        var x  = a . length * a . length ; // Initialize 'x' with a squared length.

        // Loop through each element in array 'a'.
        for ( var j = 0 ; j < a . length ; j ++ ) {

            // Find lower bound for t2-a[j] in 'b'.
            var x2 = lower_bound ( b , 0 , b . length , t2 - a [ j ] ) ;

            // Find lower bound for t-a[j] in 'b' within the range [0, x2).
            var x1 = lower_bound ( b , 0 , x2 , t - a [ j ] ) ;

            // Find lower bound for t3-a[j] in 'b' within the range [x2, b.length).
            var x3 = lower_bound ( b , x2 , b . length , t3 - a [ j ] ) ;

            // Update 'x' based on the lower bound results.
            x += - x3 + x2 - x1 ;

        }

        // If 'x' is odd, add 't' to the answer.
        if ( x % 2 ) {

            ans += t ;

        }

        // Apply bitwise AND with 'c' to all elements in 'b'.
        b = b . map ( a => a & c ) ;

        // Apply bitwise AND with 'c' to all elements in 'a'.
        a = a . map ( a => a & c ) ;

        // If 'i' is less than 18, call the nested helper function 'f' for both 'a' and 'b'.
        if ( i < 18 ) {

            a = f ( a , i ) ;
            b = f ( b , i ) ;

        } else {

            // Otherwise, sort array 'b' again.
            b . sort ( ( a , b ) => a - b ) ;

        }

    }

    // Return the final calculated answer.
    return ans ;


    /**
     * Nested helper function 'f'.
     * Processes an array 'b' and returns a new array containing elements
     * whose counts are odd, based on a bitmask 'n'.
     * @param {Array<number>} b - The input array.
     * @param {number} n - The bit shift amount for array size (1 << n).
     * @returns {Array<number>} A new array containing elements with odd counts.
     */
    function f ( b , n ) {

        // Create a frequency array 'a' of size 2^n, initialized with zeros.
        var a = Array ( 1 << n ) . fill ( 0 ) ;

        // Initialize an empty result array 'r'.
        var r = [ ] ;

        // Populate the frequency array.
        for ( var i = 0 ; i < b . length ; i ++ ) {

            a [ b [ i ] ] ++ ;

        }

        // Iterate through the frequency array.
        for ( i = 0 ; i < a . length ; i ++ ) {

            // If the count of an element is odd, add its index to the result array.
            if ( a [ i ] & 1 ) { // (a[i] % 2 !== 0)

                r . push ( i ) ;

            }

        }

        // Return the array of elements with odd counts.
        return r ;

    }

}