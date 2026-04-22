/*
 * This file contains a JavaScript program designed to process
 * a specific type of input, likely related to a grid or matrix problem,
 * such as a Sudoku puzzle validation or transformation.
 *
 * The primary function, `NotOne`, identifies indices of elements
 * that appear two or more times within an input array, indicating duplicates.
 *
 * The main part of the script reads grid data, processes it
 * row by row, column by column, and in 3x3 sub-grids,
 * marking cells that contain duplicate values within their respective
 * row, column, or sub-grid.
 */
function NotOne ( arr ) {

    // Initialize a frequency counter array for digits 0 through 9.
    // It's assumed the input numbers are single-digit integers.
    var cnt = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

    // Iterate through each value `v` in the input array `arr`.
    // Increment the count for that value in the `cnt` array.
    // The `v - 0` operation ensures `v` is treated as a number.
    arr . forEach ( function ( v ) {
        cnt [ ( v - 0 ) ]++;
    } ); // End of forEach loop for frequency counting.


    // Initialize an empty array to store numbers that are "bad" (i.e., duplicates).
    var bad = [ ] ;

    /*
     * Iterate through the frequency counter `cnt` using both value `v` (the count)
     * and index `i` (the number itself).
     * If a number's count `v` is 2 or greater, it means that number `i`
     * appeared at least twice in the original `arr`.
     * Add this duplicate number `i` to the `bad` array.
     */
    cnt . forEach ( function ( v, i ) {
        if ( v >= 2 ) {
            bad . push ( i );
        }
    } ); // End of forEach loop for identifying duplicate numbers.


    // Initialize an empty array to store the indices from the original `arr`
    // where duplicate numbers were found.
    var result = [ ];

    // Iterate through the original input array `arr` again.
    // For each value `v` at index `i`:
    // Check if `v` is present in the `bad` array (meaning `v` is a duplicate number).
    // If it is, then the current index `i` in `arr` contains a duplicate value,
    // so add `i` to the `result` array.
    arr . forEach ( function ( v, i ) {
        if ( bad . indexOf ( v ) != -1 ) {
            result . push ( i );
        }
    } ); // End of forEach loop for collecting result indices.


    // Return the array of indices where duplicate values were located
    // within the input `arr`.
    return result;

} // End of `NotOne` function definition.


// --- Main Program Execution Section ---

// Use Node.js `fs` module to synchronously read all input from `/dev/stdin`.
// The input is read as a UTF-8 encoded string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' );

// Remove any leading or trailing whitespace from the input string,
// then split it into an array of strings, where each element is a line.
var Arr = input . trim ( ) . split ( "\n" );

// Initialize an empty string variable `STR` to accumulate the final output.
var STR = "";

// The first line of the input `Arr` is expected to be the number of test cases.
// `shift()` removes and returns the first element, and `- 0` converts it to a number.
var n = Arr . shift ( ) - 0;


// Loop `n` times, once for each test case provided in the input.
for ( var I = 0; I < n; I++ ) {

    // `yx` will store the current 9x9 grid (e.g., Sudoku board) for this test case.
    var yx = [ ];

    // `YX` is an auxiliary 9x9 matrix, initialized with zeros.
    // It will be used to mark cells that contain duplicate values.
    var YX = [ ];


    // Read the next 9 lines from `Arr` to populate the 9x9 grid `yx`.
    for ( var i = 0; i < 9; i++ ) {
        // Each line is split by spaces, and then each part is converted to a number.
        var v = Arr . shift ( ) . split ( " " ) . map ( Number );
        yx . push ( v ); // Add the processed row to `yx`.

        // Initialize a corresponding row in `YX` with all zeros.
        // This ensures `YX` is a 9x9 matrix of zeros at the start of each test case grid processing.
        YX . push ( [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
    } // End of loop for reading grid input.


    // Now, process the `yx` grid to identify and mark duplicate entries
    // across rows, columns, and 3x3 blocks.
    for ( var i = 0; i < 9; i++ ) {

        // --- Step 1: Check for duplicates within the current row `i` ---
        // Call `NotOne` with the current row `yx[i]` to get indices of duplicates.
        var reX = NotOne ( yx [ i ] );

        // For each index `v` returned by `NotOne` (indicating a duplicate in `yx[i]`):
        // Increment the corresponding cell `YX[i][v]`.
        // A value of 1 or more in `YX` signifies a problematic cell.
        reX . forEach ( function ( v ) {
            YX [ i ] [ v ]++;
        } ); // End of forEach for row duplicate marking.


        // --- Step 2: Check for duplicates within the current column `i` ---
        // Create a temporary array `yy` to hold all elements from column `i`.
        var yy = [ ];
        for ( var j = 0; j < 9; j++ ) {
            yy . push ( yx [ j ] [ i ] );
        } // End of loop for constructing column array.

        // Call `NotOne` with the column array `yy` to find duplicate values.
        // `reY` will contain indices relative to `yy`, which correspond to row indices in `yx`.
        var reY = NotOne ( yy );

        // For each index `v` returned by `NotOne` (indicating a duplicate in `yy`):
        // Increment the cell `YX[v][i]`, marking the original grid cell as problematic.
        reY . forEach ( function ( v ) {
            YX [ v ] [ i ]++;
        } ); // End of forEach for column duplicate marking.


        // --- Step 3: Check for duplicates within the current 3x3 sub-grid (block) ---
        // Calculate the top-left row index `y` of the current 3x3 block.
        // `~~` is a bitwise NOT operator used as a fast `Math.floor`.
        var y = ~~ ( i / 3 );

        // Calculate the top-left column index `x` of the current 3x3 block.
        var x = i % 3;

        // Define the 9 (row, column) coordinates for all cells within this 3x3 block.
        var z = [
            [ 0 + y * 3, 0 + x * 3 ], [ 0 + y * 3, 1 + x * 3 ], [ 0 + y * 3, 2 + x * 3 ],
            [ 1 + y * 3, 0 + x * 3 ], [ 1 + y * 3, 1 + x * 3 ], [ 1 + y * 3, 2 + x * 3 ],
            [ 2 + y * 3, 0 + x * 3 ], [ 2 + y * 3, 1 + x * 3 ], [ 2 + y * 3, 2 + x * 3 ]
        ];

        // Create a temporary array `zz` to hold the actual values from the current 3x3 block.
        var zz = [ ];
        z . forEach ( function ( v ) {
            // `v` here is an array like `[row_coord, col_coord]`.
            zz . push ( yx [ v [ 0 ] ] [ v [ 1 ] ] );
        } ); // End of forEach for constructing block values array.

        // Call `NotOne` with the block values array `zz` to find duplicate values.
        // `reZ` will contain indices relative to `zz` (0-8), which correspond to the `z` coordinates.
        var reZ = NotOne ( zz );

        // For each index `v` returned by `NotOne` (indicating a duplicate in `zz`):
        // Use `z[v]` to get the actual `[row, col]` coordinates in the `yx` grid,
        // and then increment the corresponding cell in `YX` to mark it.
        reZ . forEach ( function ( v ) {
            YX [ z [ v ] [ 0 ] ] [ z [ v ] [ 1 ] ]++;
        } ); // End of forEach for block duplicate marking.

    } // End of loop for processing all rows, columns, and 3x3 blocks.


    // After all duplicate checks, format the `yx` grid for output.
    for ( var i = 0; i < 9; i++ ) {
        for ( var j = 0; j < 9; j++ ) {
            // If `YX[i][j]` is 1 or greater, it means `yx[i][j]` was part of a duplicate
            // in at least one check (row, column, or block).
            // Prefix such cells with an asterisk "*". Otherwise, prefix with a space " ".
            yx [ i ] [ j ] = ( YX [ i ] [ j ] >= 1 ) ? "*" + yx [ i ] [ j ] : " " + yx [ i ] [ j ];
        }
    } // End of loops for output formatting.


    // Join the rows of the modified `yx` grid with newline characters.
    // The `join` operation on an array of arrays will introduce commas between inner elements,
    // so `replace(/,/g, "")` removes these unwanted commas.
    // Append the result to `STR`, followed by two newline characters for separation between test cases.
    STR += yx . join ( "\n" ) . replace ( /,/g, "" ) + "\n\n";

} // End of main loop for all test cases.


// Print the final accumulated output string `STR` to the console.
// `trim()` is used to remove any trailing newline characters from the very end of `STR`.
console . log ( STR . trim ( ) );

// End of JavaScript program.