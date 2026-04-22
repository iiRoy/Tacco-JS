/* This is a JavaScript program.
 * It processes a grid-like input, transforming it based on
 * the presence of '#' characters and their neighbors.
 *
 * The core logic calculates the number of '#' neighbors for
 * each non-'#' cell in a 3x3 surrounding area.
 */
const   main    =   /* The main function begins here */
    input   =>      // The arrow function takes 'input' as its sole argument.
            input                               // Start with the raw input string.
                .split  (   '\n'   )            // Step 1: Split the input string into an array of lines using the newline character as a delimiter.
                .slice  (   1   )               // Step 2: Discard the first line of the input. This is often used to skip header information.
                .filter (   x   =>   x   )     // Step 3: Filter out any empty strings that might have resulted from the split operation.
                .map    (   line   =>           // Step 4: For each remaining 'line' string...
                    line.split  (   ''   )      // ...split it into an array of individual characters. This creates a 2D array (matrix).
                )                               // End of the initial transformation chain.
                .map    (   (   vs   ,   i   ,   matrix   )   =>   {   /* Step 5: Process each row of the character matrix.
                                                                        *   'vs' represents the current row (array of characters).
                                                                        *   'i' is the zero-based index of the current row.
                                                                        *   'matrix' is the entire 2D array, useful for accessing neighbors. */
                    return  vs.map  (   (   v   ,   j   )   =>   {   /* Step 5a: Process each individual character (cell) within the current row.
                                                                        *   'v' is the value of the current cell.
                                                                        *   'j' is the zero-based index of the current column. */
                        return  v   ===   '#'   ?   // Step 5a.i: Check if the current cell's value 'v' is exactly equal to the '#' character.
                                    '#'             // If true, the cell remains '#'. No change needed.
                                    :               // If false (the cell is not '#'), proceed to calculate neighbor count.
                                    [   i   -   1   ,   i   ,   i   +   1   ]   // Create an array of potential row indices for neighbors: one row above, current row, one row below.
                                        .filter (   x   =>   matrix[x]   )         // Filter these row indices to ensure they are valid (i.e., 'matrix[x]' exists and is not undefined).
                                        .map    (   x   =>                          // For each valid neighbor row index 'x'...
                                            [   j   -   1   ,   j   ,   j   +   1   ]   // Create an array of potential column indices for neighbors: one column left, current column, one column right.
                                                .map    (   y   =>                  // For each potential neighbor column index 'y' in the current neighbor row 'x'...
                                                    matrix[x][y]   ===   '#'   ?    // Check if the cell at `matrix[x][y]` is a '#'.
                                                        1                           // If it is, count 1.
                                                        :                           // Otherwise...
                                                        0                           // Count 0.
                                                )                                   // End of inner map for column neighbors.
                                                .reduce (   (   accumulator   ,   currentValue   )   =>   accumulator   +   currentValue   )   // Sum up the counts of '#' neighbors in this specific row 'x'.
                                        )                                           // End of outer map for row neighbors.
                                        .reduce (   (   a   ,   b   )   =>   a   +   b   )   // Sum up all the row neighbor counts to get the total '#' neighbors for the current cell.
                    }   )   // End of the inner 'vs.map' callback.
                    .join   (   ''   )   ;   // Step 5b: Join the characters (or neighbor counts) of the processed row back into a single string.
                }   )   // End of the outer 'matrix.map' callback.
                .join   (   '\n'   )   ;   // Step 6: Join all the processed row strings back into a single output string, separated by newline characters.

// --- Program Execution Section ---

/*
 * This part of the script is responsible for reading the input
 * and displaying the final processed output.
 */
console                                         // The global 'console' object provides access to debugging functions.
    .log    (                                   // Call the 'log' method of the 'console' object to print output.
        main    (                               // Pass the result of 'main' function call as an argument to 'console.log'.
            require (   'fs'   )                 // Use Node.js built-in 'fs' (file system) module.
                .readFileSync   (               // Call the 'readFileSync' method to read a file synchronously.
                    '/dev/stdin'    ,           // The first argument is the path to the file to read; '/dev/stdin' refers to standard input.
                    'utf8'                      // The second argument specifies the encoding of the file content, here 'utf8'.
                )                               // End of 'readFileSync' call.
        )                                       // End of 'main' function call.
    )   ;                                       // End of 'console.log' call.