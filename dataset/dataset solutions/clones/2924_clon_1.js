var GET = ( function ( ) { /* This IIFE defines and returns a utility for structured input reading. */

    // Public interface function 'f'
    function f ( s ) {
        return new g ( s ) ;
    } // End of function f

    // Internal class 'g' for managing input lines and parsing.
    function g ( s ) {
        // The raw input string is trimmed and split into an array of lines.
        this._s = s . trim ( ) . split ( "\n" ) ;
        // _y tracks the current line index being processed.
        this._y = 0 ;
    } // End of g constructor

    // Method 'a': Reads a single atomic value from the current line.
    g . prototype . a = function ( f ) {
        var s = this._s ,
            y = this._y ,
            r ;

        // If the current line hasn't been split yet, do so and reverse it
        // to allow popping values from the end.
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
        }

        // Pop the last value from the current line's array.
        r = s [ y ] . pop ( ) ;

        // If the current line is now empty, advance to the next line.
        if ( ! s [ y ] . length ) {
            this._y ++ ;
        }

        // Return the value as a string if 'f' is true, otherwise as a number.
        return f ? r : + r ;
    } ; // End of g.prototype.a method

    // Method 'l': Reads an entire line of space-separated values.
    g . prototype . l = function ( f ) {
        // Access the current line, increment the line index, and split by spaces.
        var s = this._s [ this._y ++ ] . split ( " " ) ;

        // Return the array of strings or an array of numbers.
        return f ? s : s . map ( a => + a ) ;
    } ; // End of g.prototype.l method

    // Method 'm': Reads 'n' lines, treating each as a row in a matrix.
    g . prototype . m = function ( n , f ) {
        // Slice 'n' lines, advance the line index, and map each line to an array of strings.
        var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

        // Return a 2D array of strings or a 2D array of numbers.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ; // End of g.prototype.m method

    // Method 'r': Reads 'n' lines as a 1D array of individual values.
    g . prototype . r = function ( n , f ) {
        // Slice 'n' lines and advance the line index.
        var r = this._s . slice ( this._y , this._y += n ) ;

        // Return an array of strings or an array of numbers.
        return f ? r : r . map ( a => + a ) ;
    } ; // End of g.prototype.r method

    // The IIFE returns the public factory function 'f'.
    return f ;

} ) ( ) ; // End of GET IIFE definition and execution.

// Initialize the input parser 'o' by reading standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

/*
 * xArray Function:
 * Creates a multi-dimensional array initialized with a specified value.
 * The dimensions are provided as subsequent arguments.
 * Example: xArray(0, 2, 3) creates a 2x3 array filled with zeros.
 */
function xArray ( v ) {
    var a = arguments , // Access all arguments.
        l = a . length ,  // Total number of arguments.
        // Start building the innermost array creation string.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})" ;

    // Loop to construct the nested Array.map calls for each dimension.
    while ( --l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    // Evaluate the dynamically created string to produce the array.
    return eval ( r ) ;
} // End of xArray function.

// Call the main function and print its return value to the console.
console . log ( main ( ) ) ;

/**
 * The main function encapsulates the core logic of the problem.
 * It reads input, performs calculations, and returns the final answer.
 * @returns {number} The maximum calculated sum.
 */
function main ( ) {

    // Read the integer 'n' from the input using the 'a' method.
    var n = o . a ( ) ;

    // Read a line of integers into array 's' using the 'l' method.
    var s = o . l ( ) ;

    // Initialize the variable to store the maximum answer found.
    var ans = 0 ;

    // Calculate 'm' as half of 'n' using a bitwise right shift.
    var m = n >> 1 ;

    // Outer loop: iterates from 1 up to (but not including) 'm'.
    for ( var i = 1 ; i < m ; i ++ ) {

        // A Set is used to track indices that have already been considered
        // in the current iteration of the outer loop.
        var set = new Set ( ) ;

        // 'k' accumulates the sum for the current inner loop iteration.
        var k = 0 ;

        // Inner loop: iterates 'j' starting from 'i', incrementing by 'i'.
        // Continues as long as 'j' is less than 'n-1'.
        for ( var j = i ; j < n - 1 ; j += i ) {

            // Check for break conditions:
            // 1. If 'j' has already been added to the set.
            // 2. If its symmetric counterpart (n-j-1) has been added.
            // 3. If 'j' is the middle element (symmetrical to itself).
            if ( set . has ( j ) || set . has ( n - j - 1 ) || j === n - j - 1 ) {
                break ;
            }

            // Add elements at index 'j' and its symmetric counterpart to 'k'.
            k += s [ j ] + s [ n - j - 1 ] ;

            // Update 'ans' if the current sum 'k' is greater.
            if ( ans < k ) {
                ans = k ;
            }

            // Add both 'j' and its symmetric counterpart to the set.
            set . add ( j ) ;
            set . add ( n - j - 1 ) ;

        } // End of inner for loop (j)

    } // End of outer for loop (i)

    // Return the final maximum answer found.
    return ans ;

} // End of main function.