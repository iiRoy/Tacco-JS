#!/usr/bin/node
// This is the shebang line, ensuring the script runs with Node.js.

/**
 * Anonymous self-executing function (IIFE - Immediately Invoked Function Expression).
 * Encapsulates the entire application logic to avoid polluting the global scope.
 */
( function ( ) {

    // T: Represents the current 2D grid or map being processed.
    // It will store sections of the input data, often representing a matrix of values.
    var T = [ ] ;

    // S: Stores all incoming lines from standard input (stdin) as an array of strings.
    // This acts as a buffer for the data to be processed in chunks.
    var S = [ ] ;

    // Obtain a readable stream for standard input.
    // This allows the program to read data piped into it or typed by the user.
    var stdin = process . openStdin ( ) ;

    // Set the encoding for the input stream to UTF-8.
    // This ensures correct handling of various characters and prevents data corruption.
    stdin . setEncoding ( 'utf8' ) ;


    /**
     * Recursive function 'rec' (likely short for 'recognize' or 'recursively clear').
     * Implements a flood-fill-like algorithm to clear adjacent 'truthy' values (e.g., '1's)
     * in the 2D grid 'T' starting from a given (x, y) coordinate.
     * This effectively "visits" and marks all connected components.
     *
     * @param {number} x - The current column index within the grid T.
     * @param {number} y - The current row index within the grid T.
     */
    var rec = function ( x , y ) {

        // Check boundary conditions to ensure (x, y) is within the grid's bounds.
        // Also, ensure the current cell T[y][x] contains a 'truthy' value (e.g., 1 or a non-empty string).
        if ( 0 <= x
             && x < T [ 0 ] . length   // Check if x is within the width of the first row.
             && 0 <= y
             && y < T . length         // Check if y is within the height of the grid.
             && T [ y ] [ x ]          // Check if the cell at (y, x) is 'truthy'.
           )
        {
            // If all conditions are met (within bounds and 'truthy'):
            // 1. Mark the current cell as 'visited' or 'cleared' by setting it to 0.
            //    This prevents infinite recursion and ensures each part of a region is processed once.
            T [ y ] [ x ] = 0 ,

            // 2. Recursively call 'rec' for all 8 adjacent neighbors (horizontal, vertical, and diagonal).
            //    The comma operator ensures all these calls are part of a single expression.
            rec ( x - 1 , y ) ,        // Neighbor to the left
            rec ( x + 1 , y ) ,        // Neighbor to the right
            rec ( x , y - 1 ) ,        // Neighbor above
            rec ( x , y + 1 ) ,        // Neighbor below

            rec ( x - 1 , y - 1 ) ,    // Diagonal: Top-Left
            rec ( x + 1 , y - 1 ) ,    // Diagonal: Top-Right
            rec ( x - 1 , y + 1 ) ,    // Diagonal: Bottom-Left
            rec ( x + 1 , y + 1 ) ;    // Diagonal: Bottom-Right
        }
    } ; // End of 'rec' function definition


    // A buffer variable to store partial lines of input received from stdin.
    // This is crucial for handling cases where a newline character might be split across multiple 'data' chunks.
    var input_fragment = "" ;


    // Event listener for incoming 'data' chunks from the standard input stream.
    // This function is executed every time new data is available.
    stdin . on ( 'data' , function ( input ) {

        // Concatenate the previously stored fragment with the new input chunk.
        // Then, split the combined string by newline characters to get individual lines.
        var ref = ( input_fragment + input ) . split ( "\n" ) ;

        // The last element of the 'ref' array might be an incomplete line (not ending with '\n').
        // Store this potentially incomplete line back into 'input_fragment' for the next 'data' event.
        input_fragment = ref . pop ( ) ;

        // Iterate through the complete lines (all elements except the last one, which was popped).
        for ( var i = 0 ; i < ref . length ; i ++ ) {

            // Skip any empty lines encountered in the input.
            if ( ref [ i ] == '' ) {
                continue ; // Move to the next line.
            }

            // Add the non-empty line to the main storage array 'S'.
            // 'S' accumulates all valid input lines.
            S . push ( ref [ i ] ) ;
        }

    } ) ; // End of 'data' event handler


    // Event listener for the 'end' of the standard input stream.
    // This function is executed once all input has been received.
    // The main processing logic for the collected data resides here.
    stdin . on ( 'end' , function ( z ) {

        // Declare variables for loop counters (i, j) and the result (r).
        var i , j , r ;

        // An infinite loop to process data in 'S' in chunks.
        // This loop continues until there are no more valid chunks to process.
        for ( ; ; ) {

            // Initialize the count of "regions" found for the current grid chunk.
            r = 0 ;

            // Extract the height 'h' for the current grid from the second character
            // of the first line in 'S'. This line is then removed from 'S'.
            // Note: This implies a specific input format where the 'height' is encoded
            // as the second character of a control line.
            var h = ( S . shift ( ) ) [ 1 ] ;

            // If 'h' is falsy (e.g., undefined, null, or an empty string after conversion),
            // it means there's no more data to process, so terminate the loop.
            if ( ! h ) {
                break ;
            }

            // Extract 'h' number of lines from the beginning of 'S' to form the current grid 'T'.
            // These lines represent the rows of the 2D grid that will be processed.
            T = S . slice ( 0 , h ) ;

            // Iterate through each cell of the 'T' grid to find and count distinct regions.
            // The outer loop iterates through columns (x-axis).
            for ( i = 0 ; i < T [ 0 ] . length ; i ++ ) {
                // The inner loop iterates through rows (y-axis).
                for ( j = 0 ; j < T . length ; j ++ ) {

                    // If a cell contains a 'truthy' value (e.g., '1' or any non-zero value),
                    // it signifies the start of a new, unvisited region.
                    if ( T [ j ] [ i ] ) {
                        // Increment the region counter.
                        r ++ ,
                        // Perform a recursive flood-fill operation starting from this cell (i, j).
                        // This clears the entire connected region, preventing parts of it from being
                        // recounted as separate regions. The comma operator keeps this as one expression.
                        rec ( i , j ) ;
                    }
                }
            }

            // Output the total number of regions found for the current grid chunk to the console.
            console . log ( r ) ;

            // Remove the processed 'h' lines from 'S' to prepare 'S' for the next grid chunk.
            // This effectively "consumes" the current grid from the buffer.
            S = S . slice ( h ) ;
        }

    } ) ; // End of 'end' event handler

// Call the immediately invoked function expression, setting 'this' to the global object.
} ) . call ( this ) ;