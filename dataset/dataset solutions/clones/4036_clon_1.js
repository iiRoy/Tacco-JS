/*
 * This file contains JavaScript code for solving a grid traversal problem.
 * It utilizes a custom input parser and performs a Breadth-First Search (BFS).
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */


// Begin definition of the GET input parsing utility.
// This is an Immediately Invoked Function Expression (IIFE)
// to create a self-contained module for reading input.
var GET = ( function ( ) {

    // Inner function 'f': Acts as a factory for parser instances.
    // It takes the raw input string 's' and returns a new 'g' object.
    function f ( s ) {
        return new g ( s ) ;
    }


    /*
     * Constructor function 'g': Initializes the parser object.
     * @param {string} s - The raw input string to be parsed.
     */
    function g ( s ) {

        // _s: Stores the input string, first trimmed, then split into an array of lines.
        // Each element of this array represents one line of input.
        this._s = s . trim ( ) . split ( "\n" ) ;

        // _y: Keeps track of the current line index being processed by the parser.
        // It starts at 0, indicating the first line.
        this._y = 0 ;
    }


    /*
     * g.prototype.a: Method to read a single "atom" (value) from the current line.
     * This method is designed to extract one token at a time from a line.
     * @param {boolean} f - A flag: if true, returns the value as a string;
     *                        otherwise, attempts to convert it to a number.
     * @returns {string|number} The extracted value.
     */
    g . prototype . a = function ( f ) {

        var s = this . _s , // Reference to the array of input lines.
            y = this . _y , // Current line index.
            r ;             // Variable to hold the result (the popped atom).

        // If the current line (s[y]) is still a single string,
        // it means it hasn't been tokenized yet.
        if ( typeof s [ y ] === "string" ) {
            // Split the line by spaces, then reverse the array.
            // Reversing allows efficient 'pop()' operations to get values from the "front" of the line.
            s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
        }


        // Extract the next atom from the current line.
        // Since the array was reversed, 'pop()' gets the logical "first" element.
        r = s [ y ] . pop ( ) ;


        // After popping, if the current line array becomes empty,
        // it signifies that all atoms on this line have been consumed.
        if ( ! s [ y ] . length ) {
            this . _y ++ ; // Advance the line counter to the next line.
        }

        // Return the extracted atom. If 'f' is true, return as string;
        // otherwise, use unary plus operator to convert to a number.
        return f ? r : + r ;
    } ;


    /*
     * g.prototype.l: Method to read an entire "line" of values.
     * It processes the current line and advances to the next.
     * @param {boolean} f - Flag: if true, returns an array of strings;
     *                        otherwise, returns an array of numbers.
     * @returns {string[]|number[]} An array containing all values from the line.
     */
    g . prototype . l = function ( f ) {

        // Get the current line (this._s[this._y]), split it by spaces,
        // and then immediately increment the line counter (this._y++).
        var s = this . _s [ this . _y ++ ] . split ( " " ) ;

        // Return the array of values. If 'f' is true, return as strings;
        // otherwise, map each element to its numeric representation.
        return f ? s : s . map ( a => + a ) ;
    } ;


    /*
     * g.prototype.m: Method to read a "matrix" (multiple lines of space-separated values).
     * @param {number} n - The number of lines (rows) to read for the matrix.
     * @param {boolean} f - Flag: if true, returns a 2D array of strings;
     *                        otherwise, a 2D array of numbers.
     * @returns {string[][]|number[][]} A 2D array representing the parsed matrix.
     */
    g . prototype . m = function ( n , f ) {

        // Slice 'n' lines from the input array, starting from the current line index.
        // The line counter (this._y) is updated to reflect the consumed lines.
        // Each sliced line is then split by spaces to form an array of row values.
        var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

        // Return the matrix. If 'f' is true, return as 2D string array;
        // otherwise, map all inner elements to numbers.
        return f ? r : r . map ( a => a . map ( a => + a ) ) ;
    } ;


    /*
     * g.prototype.r: Method to read "raw" lines (each line as a single value or string).
     * This is useful for reading lines that are not space-separated tokens but whole entities.
     * @param {number} n - The number of raw lines to read.
     * @param {boolean} f - Flag: if true, returns an array of strings;
     *                        otherwise, returns an array of numbers.
     * @returns {string[]|number[]} An array of raw lines.
     */
    g . prototype . r = function ( n , f ) {

        // Slice 'n' lines from the input array, starting from the current line index.
        // The line counter (this._y) is updated.
        var r = this . _s . slice ( this . _y , this . _y += n ) ;

        // Return the array of lines. If 'f' is true, return as strings;
        // otherwise, map each line to its numeric representation.
        return f ? r : r . map ( a => + a ) ;
    } ;


    // The IIFE returns the 'f' function, which is used to create instances of the parser.
    return f ;

} ) ( ) ; // End of GET IIFE definition.


// Initialize an instance of the GET parser 'o'.
// It reads the entire content of standard input (typically '/dev/stdin' on Linux/macOS)
// using Node.js's 'fs' module, assuming UTF-8 encoding.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// Call the main function of the program and print its return value to the console.
console . log ( main ( ) ) ;


/*
 * The main function encapsulates the primary logic for the problem.
 * It reads grid dimensions, processes a grid of characters, and finds
 * the shortest path using a BFS-like algorithm.
 *
 * This function calculates the maximum number of empty cells that can be
 * "saved" from being visited on the shortest path from (0,0) to (h-1, w-1).
 */
function main ( ) {

    // Read the height of the grid from the input.
    var h = o . a ( ) ;

    // Read the width of the grid from the input.
    var w = o . a ( ) ;

    // Read 'h' lines of the grid 's'. The '1' flag ensures they are read as raw strings.
    var s = o . r ( h , 1 ) ;


    /*
     * Initialize a 2D array 'a' of size h x w.
     * This array will serve as a visited tracker and store the distance (number of steps)
     * from the starting point (0,0) to each cell during the BFS.
     * All cells are initially set to 0 (unvisited).
     */
    var a = Array ( h ) . fill ( 0 ) . map ( a => Array ( w ) . fill ( 0 ) ) ;

    // Mark the starting cell (0,0) as visited with a special value (-1).
    // This prevents revisiting the start and helps distinguish it from other distances.
    a [ 0 ] [ 0 ] = -1 ;


    // Initialize 'ans' variable. This will store the total count of '.' (empty) cells in the grid.
    var ans = 0 ;

    /*
     * Loop through each row of the input grid 's' to count all '.' characters.
     * The 'match(/\./g)' regular expression finds all occurrences of '.' in a string.
     * '.length' gives the count of matches.
     */
    for ( var i = 0 ; i < h ; i ++ ) {
        ans += s [ i ] . match ( / \. / g ) . length ;
    }


    // Initialize 'p' (current level's queue) with the starting coordinates [0,0].
    var p = [ [ 0 , 0 ] ] ;

    // Adjust 'h' and 'w' to represent the 0-indexed maximum row and column indices.
    // This simplifies boundary checks in the BFS loop.
    h -- ;
    w -- ;


    // Main BFS loop. 'i' represents the current distance/number of steps from the start.
    // The loop continues indefinitely until a return statement is hit (either path found or no path).
    for ( i = 1 ; ; i ++ ) {

        /*
         * If the current queue 'p' is empty, it means there are no more cells
         * to visit at the current level, and the destination has not been reached.
         * In this case, no path exists.
         */
        if ( p . length === 0 ) {
            return -1 ; // Indicate that the destination is unreachable.
        }


        // Initialize 't' (next level's queue) as an empty array.
        // This will store all valid neighbors found at the current step 'i'.
        var t = [ ] ;


        // Process all cells in the current level 'p'.
        // The 'while' loop continues as long as there are cells in the current queue.
        while ( p . length ) {

            // Dequeue a cell from 'p'. The popped element 'x' is an array [y, x].
            // Destructure 'x' to get the row 'y' and column 'x'.
            var x = p . pop ( ) ,
                y = x [ 0 ] ; // Get row index.

            x = x [ 1 ] ;     // Get column index.


            // Check if the current cell (y, x) is the destination cell (h, w).
            if ( y === h && x === w ) {
                // If destination reached, calculate the result:
                // total empty cells minus the number of steps taken (i).
                return ans - i ;
            }


            // Explore the UP neighbor: (y-1, x).
            // Conditions:
            // 1. 'y' > 0 (not in the first row).
            // 2. 'a[y-1][x]' is 0 (neighbor not yet visited).
            // 3. 's[y-1][x]' is "." (neighbor is an empty path).
            if ( y && a [ y - 1 ] [ x ] === 0 && s [ y - 1 ] [ x ] === "." ) {
                a [ y - 1 ] [ x ] = i ;         // Mark neighbor as visited with current step 'i'.
                t . push ( [ y - 1 , x ] ) ;    // Add neighbor to the next level's queue.
            }


            // Explore the DOWN neighbor: (y+1, x).
            // Conditions:
            // 1. 'y' < 'h' (not in the last row).
            // 2. 'a[y+1][x]' is 0 (neighbor not yet visited).
            // 3. 's[y+1][x]' is "." (neighbor is an empty path).
            if ( y < h && a [ y + 1 ] [ x ] === 0 && s [ y + 1 ] [ x ] === "." ) {
                a [ y + 1 ] [ x ] = i ;         // Mark neighbor as visited.
                t . push ( [ y + 1 , x ] ) ;    // Add neighbor to the next level's queue.
            }


            // Explore the LEFT neighbor: (y, x-1).
            // Conditions:
            // 1. 'x' > 0 (not in the first column).
            // 2. 'a[y][x-1]' is 0 (neighbor not yet visited).
            // 3. 's[y][x-1]' is "." (neighbor is an empty path).
            if ( x && a [ y ] [ x - 1 ] === 0 && s [ y ] [ x - 1 ] === "." ) {
                a [ y ] [ x - 1 ] = i ;         // Mark neighbor as visited.
                t . push ( [ y , x - 1 ] ) ;    // Add neighbor to the next level's queue.
            }


            // Explore the RIGHT neighbor: (y, x+1).
            // Conditions:
            // 1. 'x' < 'w' (not in the last column).
            // 2. 'a[y][x+1]' is 0 (neighbor not yet visited).
            // 3. 's[y][x+1]' is "." (neighbor is an empty path).
            if ( x < w && a [ y ] [ x + 1 ] === 0 && s [ y ] [ x + 1 ] === "." ) {
                a [ y ] [ x + 1 ] = i ;         // Mark neighbor as visited.
                t . push ( [ y , x + 1 ] ) ;    // Add neighbor to the next level's queue.
            }

        } // End of while (p.length) loop for current level.


        // After processing all cells at the current level,
        // the next level's queue 't' becomes the current queue 'p' for the next iteration.
        p = t ;

    } // End of main for loop (BFS traversal).

} // End of main function.