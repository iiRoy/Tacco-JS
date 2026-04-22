/*
 * This file implements a solution for a grid-based problem.
 * It uses a custom input parser 'GET' to read data from standard input.
 * The main logic involves flood-filling (or connected components)
 * to group adjacent cells based on a condition, and then calculating
 * a result based on these groups.
 */

// Define the GET module using an Immediately Invoked Function Expression (IIFE).
// This module provides utility methods for parsing various types of input.
var GET = ( function( ) {

    /**
     * Factory function to create a new input parser instance.
     * @param {string} s - The raw input string.
     * @returns {g} A new instance of the input parser.
     */
    function f( s ) {
        return new g( s ) ;
    }

    /**
     * Constructor for the input parser.
     * Initializes the internal state with processed input lines.
     * @param {string} s - The raw input string.
     */
    function g( s ) {
        // Trim leading/trailing whitespace and split into lines.
        this._s = s . trim( ) . split( "\n" ) ;
        // Initialize the current line index.
        this._y = 0 ;
    }

    /**
     * Reads a single item (number or string) from the current line.
     * If the line is being read for the first time, it's reversed.
     * @param {boolean} f - If true, returns the item as a string; otherwise, as a number.
     * @returns {string|number} The parsed item.
     */
    g . prototype . a = function( f ) {
        var s = this . _s ,
            y = this . _y ,
            r ;

        // If the current line hasn't been split and reversed yet, do it.
        if ( typeof s[ y ] === "string" ) {
            s[ y ] = s[ y ] . split( " " ) . reverse( ) ;
        }

        // Pop the last element (which is the first due to reversal).
        r = s[ y ] . pop( ) ;

        // If the line is now empty, advance to the next line.
        if ( ! s[ y ] . length ) {
            this . _y ++ ;
        }

        // Return as string or number based on 'f' flag.
        return f ? r : + r ;
    } ;

    /**
     * Reads an entire line of space-separated items.
     * Advances to the next line after reading.
     * @param {boolean} f - If true, returns items as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of parsed items.
     */
    g . prototype . l = function( f ) {
        // Split the current line by spaces and then advance the line index.
        var s = this . _s[ this . _y ++ ] . split( " " ) ;

        // Return as strings or map to numbers.
        return f ? s : s . map( a => + a ) ;
    } ;

    /**
     * Reads 'n' lines, parsing each into an array of space-separated items.
     * Advances the line index by 'n'.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns items as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array of parsed items.
     */
    g . prototype . m = function( n , f ) {
        // Slice 'n' lines, map each to an array of split strings.
        var r = this . _s . slice( this . _y , this . _y += n ) . map( a => a . split( " " ) ) ;

        // Return as strings or map all nested items to numbers.
        return f ? r : r . map( a => a . map( a => + a ) ) ;
    } ;

    /**
     * Reads 'n' lines as raw strings or converts them to numbers.
     * Advances the line index by 'n'.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns lines as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of raw or numeric lines.
     */
    g . prototype . r = function( n , f ) {
        // Slice 'n' lines.
        var r = this . _s . slice( this . _y , this . _y += n ) ;

        // Return as strings or map to numbers.
        return f ? r : r . map( a => + a ) ;
    } ;

    // The IIFE returns the factory function 'f'.
    return f ;

} ) ( ) ; // End of GET module definition.


// Read input from /dev/stdin using Node.js 'fs' module.
// The input is then passed to the GET parser.
var o = GET( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;


// Output the result of the main function.
console . log( main( ) ) ;


/**
 * Main function to solve the problem.
 * It reads grid dimensions, processes the grid to identify connected components,
 * and calculates a specific sum based on these components.
 * @returns {number} The final calculated answer.
 */
function main( ) {

    // Read grid height and width.
    var h = o . a( ) ;
    var w = o . a( ) ;

    // Read the grid content as an array of strings (lines).
    // The '1' flag ensures strings are returned.
    var s = o . r( h , 1 ) ;

    // Initialize a 2D array 'b' to store region IDs for flood fill.
    // All cells are initially 0 (unvisited).
    var b = Array( h ) . fill( 0 ) . map( a => Array( w ) . fill( 0 ) ) ;

    // 'k' will be the counter for unique region IDs.
    var k = 0 ;

    // Iterate through each cell of the grid to perform flood fill.
    for ( var y = 0 ; y < h ; y ++ ) {
        for ( var x = 0 ; x < w ; x ++ ) {
            // If the cell has already been assigned a region ID, skip it.
            if ( b[ y ][ x ] !== 0 ) {
                continue ;
            }

            // Assign a new region ID to the current unvisited cell.
            b[ y ][ x ] = ++ k ;

            // 'l' is the list (queue/stack) for BFS/DFS traversal.
            // Start with the current cell.
            var l = [ [ y , x ] ] ;

            // Perform a traversal (BFS/DFS) to find all connected cells.
            while ( l . length ) {
                // Pop a cell from the list. 'i' becomes row, 'j' becomes column.
                var i = l . pop( ) ,
                    j = i[ 1 ] ;
                i = i[ 0 ] ;

                // Check top neighbor:
                // - Within bounds (i > 0)
                // - Not yet visited (b[i-1][j] === 0)
                // - Different character from current cell (s[i][j] !== s[i-1][j])
                if ( i > 0 && b[ i - 1 ][ j ] === 0 && s[ i ][ j ] !== s[ i - 1 ][ j ] ) {
                    b[ i - 1 ][ j ] = k ; // Assign current region ID
                    l . push( [ i - 1 , j ] ) ; // Add to list for further exploration
                }

                // Check bottom neighbor:
                if ( i < h - 1 && b[ i + 1 ][ j ] === 0 && s[ i ][ j ] !== s[ i + 1 ][ j ] ) {
                    b[ i + 1 ][ j ] = k ;
                    l . push( [ i + 1 , j ] ) ;
                }

                // Check left neighbor:
                if ( j > 0 && b[ i ][ j - 1 ] === 0 && s[ i ][ j ] !== s[ i ][ j - 1 ] ) {
                    b[ i ][ j - 1 ] = k ;
                    l . push( [ i , j - 1 ] ) ;
                }

                // Check right neighbor:
                if ( j < w - 1 && b[ i ][ j + 1 ] === 0 && s[ i ][ j ] !== s[ i ][ j + 1 ] ) {
                    b[ i ][ j + 1 ] = k ;
                    l . push( [ i , j + 1 ] ) ;
                }
            }
        }
    }

    // 'c' will store counts for each region ID.
    // c[region_id][0] = count of '.' cells in region
    // c[region_id][1] = count of other cells (e.g., '#') in region
    // Initialize with k+1 entries, each being [0, 0].
    var c = Array( k + 1 ) . fill( 0 ) . map( a => [ 0 , 0 ] ) ;

    // Initialize the answer variable.
    var ans = 0 ;

    // Iterate through the grid again to count '.' and other characters
    // within each identified region.
    for ( i = 0 ; i < h ; i ++ ) {
        for ( j = 0 ; j < w ; j ++ ) {
            if ( s[ i ][ j ] === "." ) {
                c[ b[ i ][ j ] ][ 0 ] ++ ; // Increment '.' count for this region
            } else {
                c[ b[ i ][ j ] ][ 1 ] ++ ; // Increment other char count for this region
            }
        }
    }

    // Calculate the final answer.
    // For each region, multiply the count of '.' cells by the count of other cells,
    // and sum these products.
    // Note: c[0] is for unassigned/initial cells, which should be 0, so it doesn't affect the sum.
    for ( i = 0 ; i <= k ; i ++ ) {
        ans += c[ i ][ 0 ] * c[ i ][ 1 ] ;
    }

    // Return the final result.
    return ans ;
}