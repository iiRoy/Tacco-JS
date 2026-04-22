"use strict"
; /* Enable strict mode for better error handling */


/*
 * This immediately invoked function expression (IIFE)
 * encapsulates the GET module, preventing global scope pollution.
 * It's designed to read structured input.
 */
var GET = (function () {
    /* Helper function to create a new G instance */
    function f ( s ) {
        // Returns a new instance of the G class
        return new g ( s ) ;
    }

    /*
     * G class constructor.
     * Initializes the internal state for reading lines.
     */
    function g ( s ) {
        // Trim the input string and split it into an array of lines
        this._s = s . trim ( ) . split ( "\n" ) ;
        // Initialize the current line index
        this._y = 0 ;
    }

    /*
     * G.prototype.a: Reads an "atom" (single value) from the current line.
     * If 'f' is true, returns as a string; otherwise, as a number.
     */
    g . prototype . a = function ( f ) {
        var s = this . _s ,       // Reference to the lines array
            y = this . _y ,       // Current line index
            r ;                   // Variable to hold the result

        // If the current line hasn't been processed into an array of words
        if ( typeof s [ y ] === "string" ) {
            // Split the line by spaces and reverse the order for easy 'pop' operation
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
        }

        // Pop the last element (which was the first in original order)
        r = s [ y ] . pop ( ) ;

        // If the current line is now empty, advance to the next line
        if ( ! s [ y ] . length ) {
            this . _y ++ ;
        }

        // Return the result, either as string or number based on 'f'
        return f ? r : + r ;
    } ;

    /*
     * G.prototype.l: Reads an entire line.
     * If 'f' is true, returns as an array of strings; otherwise, as an array of numbers.
     */
    g . prototype . l = function ( f ) {
        // Get the current line, split it by spaces, and then increment the line index
        var s = this . _s [ this . _y ++ ] . split ( " " ) ;

        // Return the array, mapping to numbers if 'f' is false
        return f ? s : s . map ( a => + a ) ;
    } ;

    /*
     * G.prototype.m: Reads 'n' lines as a matrix.
     * If 'f' is true, returns as a 2D array of strings; otherwise, as numbers.
     */
    g . prototype . m = function ( n , f ) {
        // Slice 'n' lines from the input, incrementing the line index
        var r = this . _s . slice ( this . _y , this . _y += n )
                       . map ( a => a . split ( " " ) ) ; // Split each line into words

        // Return the 2D array, mapping inner arrays to numbers if 'f' is false
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;

    /*
     * G.prototype.r: Reads 'n' raw lines.
     * If 'f' is true, returns as an array of strings; otherwise, as an array of numbers.
     */
    g . prototype . r = function ( n , f ) {
        // Slice 'n' lines from the input, incrementing the line index
        var r = this . _s . slice ( this . _y , this . _y += n ) ;

        // Return the array, mapping to numbers if 'f' is false
        return f ? r : r . map ( a => + a ) ;
    } ;

    // Return the factory function 'f'
    return f ;
}) ( ) ;


// Initialize the input reader with content from standard input
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 * xArray: A utility function to create multi-dimensional arrays initialized with a value.
 * Uses eval for dynamic array creation based on arguments.
 */
function xArray ( v ) {
    var a = arguments ,         // All arguments passed to the function
        l = a . length ,        // Number of arguments
        r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ; // Innermost array creation string

    // Build the array creation string from inside out
    while ( -- l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    // Evaluate the dynamically created string to produce the array
    return eval ( r ) ;
}


// Define a large number to represent infinity for comparisons
var INF = 1e15 ;


// Execute the main function and print its result to the console
console . log ( main ( ) ) ;


/*
 * main: The primary logic function for the program.
 * Solves a dynamic programming problem.
 */
function main ( ) {
    // Read 'n' from input
    var n = o . a ( ) ;
    // Read 'x' from input
    var x = o . a ( ) ;
    // Read a line of 'h' values, prepending a 0
    var h = [ 0 ] . concat ( o . l ( ) ) ;

    // Initialize a 2x2 DP table with INF values
    var dp = xArray ( INF , 2 , 2 ) ;

    // Base cases for the DP table
    dp [ 0 ] [ 0 ] = h [ 1 ] ;
    dp [ 1 ] [ 1 ] = 0 ;

    // Iterate through the main loop from 1 to n-1
    for ( var i = 1 ; i < n ; i ++ ) {
        // Calculate mn, which is Math.min(i, x) + 1
        var mn = Math . min ( i , x ) + 1 ;
        // Initialize a new DP table for the current iteration
        var dp2 = xArray ( INF , mn + 1 , mn + 1 ) ;

        // Inner loop for j
        for ( var j = 0 ; j < mn ; j ++ ) {
            // Innermost loop for k
            for ( var k = j ; k < mn ; k ++ ) {
                // Calculate 't' based on h values
                var t = Math . max ( 0 , h [ i + 1 ] - h [ i - j ] ) ;
                // Update dp2 if a smaller value is found
                if ( dp [ k ] [ j ] + t < dp2 [ k ] [ 0 ] ) {
                    dp2 [ k ] [ 0 ] = dp [ k ] [ j ] + t ;
                }
            }

            // Conditional block for j < x
            if ( j < x ) {
                // Another innermost loop for k
                for ( var k = j ; k < mn ; k ++ ) {
                    // Update dp2 based on dp[k][j]
                    if ( dp [ k ] [ j ] < dp2 [ k + 1 ] [ j + 1 ] ) {
                        dp2 [ k + 1 ] [ j + 1 ] = dp [ k ] [ j ] ;
                    }
                }
            }
        }
        // Update the main DP table for the next iteration
        dp = dp2 ;
    }

    // Initialize answer with INF
    var ans = INF ;

    // Find the minimum value in the last row of the DP table
    for ( var i = 0 ; i <= x ; i ++ ) {
        if ( dp [ x ] [ i ] < ans ) {
            ans = dp [ x ] [ i ] ;
        }
    }

    // Return the final answer
    return ans ;
}