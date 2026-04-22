"use strict";
// This ensures that the code runs in strict mode, catching common coding errors.


/*
 * The GET module is designed to parse input data,
 * typically from standard input, in a structured way.
 * It provides methods to read numbers, lines, or blocks of data.
 */
var GET = ( function () {

    // The main entry point for the GET module.
    // It takes a string 's' (the input data) and returns a new parser instance.
    function f ( s ) {

        return new g ( s ) ;
    }

    // The constructor for the parser object.
    // It initializes the internal state based on the input string.
    function g ( s ) {
        // Store the input string, split by newlines, and trim each line.
        this._s = s . trim () . split ( "\n" ) ;
        // Initialize the current line index to 0.
        this._y = 0 ;
    }

    // Prototype method 'a' (presumably for "atom" or "argument").
    // Reads a single value from the current line.
    // If 'f' is true, returns as string; otherwise, converts to number.
    g . prototype . a = function ( f ) {
        var s = this._s , // Reference to the array of input lines.
            y = this._y , // Current line index.
            r ;             // Variable to hold the result.

        // If the current line hasn't been processed into an array yet,
        // split it by spaces and reverse it for efficient 'pop' operations.
        if ( typeof s [ y ] === "string" ) {
            s [ y ] = s [ y ] . split ( " " ) . reverse () ;
        }

        // Pop the last element from the (reversed) current line array.
        r = s [ y ] . pop () ;

        // If the current line is now empty, advance to the next line.
        if ( ! s [ y ] . length ) {
            this._y ++ ;
        }

        // Return the result, optionally converting to a number.
        return f ? r : + r ;
    } ;

    // Prototype method 'l' (presumably for "line").
    // Reads an entire line of values.
    // If 'f' is true, returns as array of strings; otherwise, converts all to numbers.
    g . prototype . l = function ( f ) {
        // Get the current line, split by spaces, and then advance the line index.
        var s = this._s [ this._y ++ ] . split ( " " ) ;

        // Return the array, optionally converting all elements to numbers.
        return f ? s : s . map ( a => + a ) ;
    } ;

    // Prototype method 'm' (presumably for "matrix").
    // Reads 'n' lines and treats them as a matrix of values.
    // If 'f' is true, returns as 2D array of strings; otherwise, converts all to numbers.
    g . prototype . m = function ( n , f ) {
        // Slice 'n' lines from the input, advance the line index,
        // and map each line to an array of strings (split by spaces).
        var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

        // Return the 2D array, optionally converting all elements to numbers.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;

    // Prototype method 'r' (presumably for "rows" or "raw").
    // Reads 'n' lines as raw strings or as an array of numbers.
    // If 'f' is true, returns as array of strings; otherwise, converts all to numbers.
    g . prototype . r = function ( n , f ) {
        // Slice 'n' lines from the input and advance the line index.
        var r = this._s . slice ( this._y , this._y += n ) ;

        // Return the array, optionally converting all elements to numbers.
        return f ? r : r . map ( a => + a ) ;
    } ;

    // Return the main function 'f' to be used externally.
    return f ;

} ) ( ) ; // Immediately invoke the IIFE to initialize GET.



// Initialize the input parser 'o' by reading from standard input.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;



/**
 * Dynamically creates a multi-dimensional array filled with a given value.
 * The dimensions are passed as additional arguments after 'v'.
 * Uses eval, which should be used with caution, but is common in competitive programming.
 * @param {*} v The value to fill the array with.
 * @param {...number} dimensions The dimensions of the array.
 * @returns {Array} A multi-dimensional array.
 */
function xArray ( v ) {
    var a = arguments , // All arguments passed to the function.
        l = a . length , // Number of arguments.
        // Start building the string for the innermost array.
        r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ;

    // Build the string for outer arrays iteratively.
    while ( -- l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    // Evaluate the constructed string to create the array.
    return eval ( r ) ;
}



// Declare global variables for the grid, its dimensions, and the input map.
var diff , // Stores the distance from the starting point for BFS.
    h ,    // Height of the grid.
    w ,    // Width of the grid.
    s ;    // The input grid (map).



// Execute the main logic and print the result to the console.
console . log ( main () ) ;



/**
 * The main function that orchestrates the solution.
 * It reads the grid dimensions, the grid itself, and then
 * iterates through the grid to find '.' cells, performing BFS from each.
 * It tracks the maximum distance found.
 * @returns {number} The maximum distance found in the grid.
 */
function main () {
    // Read height and width using the GET parser.
    h = o . a () ;
    w = o . a () ;

    // Read the grid rows as strings (f=1 keeps them as strings).
    s = o . r ( h , 1 ) ;

    var ans = 0 ; // Initialize the answer (maximum distance).

    // Iterate through each cell of the grid.
    for ( var y = 0 ; y < h ; y ++ ) {
        for ( var x = 0 ; x < w ; x ++ ) {
            // If the current cell is a traversable path ('.').
            if ( s [ y ] [ x ] === "." ) {
                // Perform a Breadth-First Search (BFS) from this cell.
                solve ( y , x ) ;

                // After BFS, iterate through the 'diff' array to find the maximum distance.
                for ( var i = 0 ; i < h ; i ++ ) {
                    for ( var j = 0 ; j < w ; j ++ ) {
                        if ( ans < diff [ i ] [ j ] ) {
                            ans = diff [ i ] [ j ] ;
                        }
                    }
                }
            }
        }
    }

    // Return the overall maximum distance found.
    return ans ;
}



/**
 * Performs a Breadth-First Search (BFS) starting from a given cell (y, x)
 * to calculate the shortest distance from that cell to all other reachable cells.
 * The distances are stored in the global 'diff' array.
 * @param {number} y The starting row coordinate.
 * @param {number} x The starting column coordinate.
 */
function solve ( y , x ) {
    // Initialize the 'diff' array with -1, indicating unvisited cells.
    // Dimensions are h (height) and w (width).
    diff = xArray ( -1 , h , w ) ;

    // The distance from the starting cell to itself is 0.
    diff [ y ] [ x ] = 0 ;

    // Initialize the queue for BFS with the starting coordinates.
    var q = [ y , x ] ;

    var d = 1 ; // Initialize the distance counter for the next level of BFS.

    // Continue BFS as long as there are cells in the queue.
    while ( q . length ) {
        var qq = [] ; // New queue for the next level of BFS.

        // Process all cells in the current level's queue.
        while ( q . length ) {
            // Dequeue a cell (x then y, as it was pushed as [y, x]).
            x = q . pop () ;
            y = q . pop () ;

            // Check the cell to the left.
            // Ensure it's within bounds, unvisited, and traversable.
            if ( x && diff [ y ] [ x - 1 ] === -1 && s [ y ] [ x - 1 ] === "." ) {
                diff [ y ] [ x - 1 ] = d ; // Set distance.
                qq . push ( y , x - 1 ) ;   // Enqueue for the next level.
            }

            // Check the cell to the right.
            if ( x < w - 1 && diff [ y ] [ x + 1 ] === -1 && s [ y ] [ x + 1 ] === "." ) {
                diff [ y ] [ x + 1 ] = d ;
                qq . push ( y , x + 1 ) ;
            }

            // Check the cell above.
            if ( y && diff [ y - 1 ] [ x ] === -1 && s [ y - 1 ] [ x ] === "." ) {
                diff [ y - 1 ] [ x ] = d ;
                qq . push ( y - 1 , x ) ;
            }

            // Check the cell below.
            if ( y < h - 1 && diff [ y + 1 ] [ x ] === -1 && s [ y + 1 ] [ x ] === "." ) {
                diff [ y + 1 ] [ x ] = d ;
                qq . push ( y + 1 , x ) ;
            }
        }

        d ++ ; // Increment distance for the next level.
        q = qq ; // Move to the next level's queue.
    }
}