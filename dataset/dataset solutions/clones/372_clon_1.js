/*
 * This JavaScript file processes input data, likely related to
 * a grid or puzzle, identifying elements that appear more than once
 * within certain groupings (rows, columns, 3x3 blocks).
 *
 * This is a Type I clone, preserving all identifiers and logic,
 * varying only whitespace and comments.
 */

/**
 *  Finds indices of elements in an array that appear two or more times.
 *  It's designed for single-digit numbers (0-9).
 *
 *  @param {Array<number>} arr - The input array of numbers.
 *  @returns {Array<number>} An array of original indices where the
 *                           values at those indices are duplicates.
 */
function NotOne( arr ) {
    // Initialize a frequency counter for digits 0-9.
    var cnt = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

    // Populate the counter based on values in the input array.
    // The (v-0) ensures numeric interpretation if v was a string.
    arr.forEach( function( v ) {
        cnt[ ( v - 0 ) ]++;
    } );

    // Identify which numbers (0-9) are duplicates (appear >= 2 times).
    var bad = [];
    cnt.forEach( function( v, i ) {
        if ( v >= 2 ) {
            bad.push( i ); // Store the duplicate number itself.
        }
    } );

    // Now, find the *original indices* in 'arr' where these bad numbers are located.
    var result = [];
    arr.forEach( function( v, i ) {
        // If the current value 'v' is one of the 'bad' (duplicate) numbers...
        if ( bad.indexOf( v ) != -1 ) {
            result.push( i ); // ...add its original index 'i' to the result.
        }
    } );

    // Return the list of indices where duplicate numbers were found.
    return result;
}

// --- Main script execution starts here ---

// Read the entire standard input as a string.
var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

// Process the input: trim whitespace, then split into an array of lines.
var Arr = input.trim().split( "\n" );

// Initialize an empty string to accumulate the formatted output.
var STR = "";

// The first line of input indicates the number of test cases.
var n = Arr.shift() - 0; // Convert the first line to a number.

// Loop through each test case.
for ( var I = 0; I < n; I++ ) {
    // yx will store the actual grid values for the current test case.
    var yx = [];
    // YX will store counts of 'bad' (duplicate) occurrences for each cell.
    var YX = [];

    // Read 9 lines for the current test case, each representing a row.
    for ( var i = 0; i < 9; i++ ) {
        // Split the line by space, then map each part to a Number.
        var v = Arr.shift().split( " " ).map( Number );
        yx.push( v ); // Add the parsed row to yx.
        // Initialize a corresponding row in YX with zeros.
        YX.push( [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
    }

    /*
     * Check for duplicates within each row.
     * Iterate through each row of the yx grid.
     */
    for ( var i = 0; i < 9; i++ ) {
        // Call NotOne to find duplicate indices in the current row.
        var re = NotOne( yx[ i ] );
        // For each index returned by NotOne, increment the corresponding cell in YX.
        re.forEach( function( v ) {
            YX[ i ][ v ]++;
        } );
    }

    /*
     * Check for duplicates within each column.
     * Iterate through each column index.
     */
    for ( var i = 0; i < 9; i++ ) {
        // Build a temporary array representing the current column.
        var yy = [];
        for ( var j = 0; j < 9; j++ ) {
            yy.push( yx[ j ][ i ] );
        }
        // Find duplicates in this column.
        var re = NotOne( yy );
        // Increment YX for cells in this column that are duplicates.
        re.forEach( function( v ) {
            YX[ v ][ i ]++;
        } );
    }

    /*
     * Check for duplicates within each 3x3 block.
     * Iterate through the 3x3 blocks by their top-left corner coordinates.
     */
    for ( var y = 0; y < 3; y++ ) {
        for ( var x = 0; x < 3; x++ ) {
            // Define the coordinates of cells within the current 3x3 block.
            var z = [
                [ 0 + y * 3, 0 + x * 3 ], [ 0 + y * 3, 1 + x * 3 ], [ 0 + y * 3, 2 + x * 3 ],
                [ 1 + y * 3, 0 + x * 3 ], [ 1 + y * 3, 1 + x * 3 ], [ 1 + y * 3, 2 + x * 3 ],
                [ 2 + y * 3, 0 + x * 3 ], [ 2 + y * 3, 1 + x * 3 ], [ 2 + y * 3, 2 + x * 3 ]
            ];

            // Extract the values from yx for the current 3x3 block.
            var zz = [];
            z.forEach( function( v ) {
                zz.push( yx[ v[ 0 ] ][ v[ 1 ] ] );
            } );

            // Find duplicates within this 3x3 block.
            var re = NotOne( zz );

            // Increment YX for cells in this block that are duplicates.
            re.forEach( function( v ) {
                YX[ z[ v ][ 0 ] ][ z[ v ][ 1 ] ]++;
            } );
        }
    }

    /*
     * Final formatting of the grid for output.
     * If a cell in YX has a count >= 1, it means the corresponding
     * cell in yx was part of at least one duplicate set (row, col, or block).
     * Mark such cells with an asterisk.
     */
    yx.forEach( function( V, i ) { // V is the current row, i is its index.
        V.forEach( function( v, j ) { // v is the cell value, j is its column index.
            // If YX[i][j] is 1 or more, prefix the value with "*", otherwise with a space.
            yx[ i ][ j ] = ( YX[ i ][ j ] >= 1 ) ? "*" + v : " " + v;
        } );
    } );

    // Join the rows of the modified yx grid with newlines,
    // remove any commas introduced by join, and append to STR.
    // Add an extra newline for separation between test cases.
    STR += yx.join( "\n" ).replace( /\,/g, "" ) + "\n\n";
}

// Print the accumulated output string, trimming any trailing newlines.
console.log( STR.trim() );