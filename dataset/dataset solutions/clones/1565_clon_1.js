/**
 * This is a modified JSDoc comment for the main function.
 *
 * @param { String } raw_input   The raw input string provided to the function.
 */
function   Main (   raw_input   )   {

    // Split the raw input into lines. The first line is 'first', the rest are 'trail'.
    const   [   first   ,   ...trail   ]   =   raw_input .   split (   "\n"   )   ;

    // Parse the first line to get the dimensions (height 'h' and width 'w').
    const   [   h   ,   w   ]   =   toNumArray (   first   )   ;

    /*
     * Convert the remaining input lines into a 2D array (matrix).
     * Each element in the matrix is parsed as an integer.
     * The 'arr' essentially holds coordinate ranges for each row.
     */
    const   arr   =   toMatrix (   trail ,   ' '   ) .   map (   a1   =>   a1 .   map (   a2   =>   parseInt (   a2 ,   10   )   )   )   ;

    // Add a null element at the beginning to allow for 1-based indexing for rows (y-coordinate).
    arr .   unshift (   null   )   ;


    /**
     * This array stores the minimum number of moves required to reach each row (y-coordinate).
     * Initialized with -1, indicating that a row has not yet been reached or calculated.
     *
     * @type Array<number> An array where `resultK[i]` will hold the minimum moves to reach row `i + 1`.
     */
    let   resultK   =   new   Array (   h   ) .   fill (   -1   )   ;


    // This line was previously commented out and remains so, with adjusted whitespace.
    // let minResultK = new Array(h).fill(w * h * 2);

    // Iterate through all possible starting columns, from 1 to 'w'.
    for   (   let   n   =   1 ;   n   <=   w ;   n++   )   {

        let   x   =   n   ,   y   =   1   ; // Initialize current x (column) and y (row) for the path.

        let   moveCnt   =   0   ; // Initialize the move counter for the current path.

        // The main movement loop for a single path, labeled 'out' for breaking.
        out   :   while   (   true   )   {

            moveCnt++; // Increment the move counter for every step taken.

            // Check if it's permissible to move downwards from the current position (x, y).
            if   (   canGoDown (   x ,   y   )   )   {

                y++; // Move one step down to the next row.

                // If this path is shorter or it's the first time reaching this row, update resultK.
                if   (   resultK [   y   -   2   ]   ===   -1   ||   moveCnt   <   resultK [   y   -   2   ]   )   {
                    resultK [   y   -   2   ]   =   moveCnt   ; // Store the minimum moves to reach row (y-1).
                }

                // If the current row 'y' exceeds the maximum height 'h', the path is complete.
                if   (   y   >   h   )   break   out   ;

            }   else   {
                // If moving down is not allowed, then move right by incrementing x.
                x++;

                // If the current column 'x' exceeds the maximum width 'w', the path is complete.
                if   (   x   >   w   )   break   out   ;
            }

        } // End of the 'out' while loop.

    } // End of the 'for' loop iterating through starting columns.


    // Output the final array containing the minimum moves to reach each row.
    console .   log (   resultK   )   ;


    /**
     * Helper function to determine if a downward move is allowed from coordinates (x, y).
     *
     * @param { number } x   The current column index.
     * @param { number } y   The current row index.
     * @returns { boolean }   True if movement down is permitted, false otherwise.
     */
    function   canGoDown (   x ,   y   )   {

        // Retrieve the 'from' and 'to' range for the current row 'y' from the 'arr' matrix.
        const   [   from   ,   to   ]   =   arr [   y   ]   ;

        // A downward move is allowed if the current column 'x' is NOT within the forbidden range [from, to].
        return   ! (   from   <=   x   &&   x   <=   to   )   ;

    } // End of canGoDown function definition.

    // Another commented out line from the original code, preserved.
    // console.log(canGoDown(1, 3, arr), canGoDown(2, 3, arr), canGoDown(3, 3, arr), canGoDown(4, 3, arr));

} // End of the Main function definition.


/*
 * This section handles the standard input/output.
 * It reads the entire content from /dev/stdin synchronously and passes it to the Main function.
 * Do not modify any code below this line, as it pertains to the execution environment.
 */
Main (   require (   "fs"   ) .   readFileSync (   "/dev/stdin" ,   "utf8"   )   )   ;


// --- Utility Functions ---
// These are general-purpose utility functions that support the main logic.

/**
 * Converts a string into an array of numbers.
 * The string is split by a specified delimiter, and each resulting substring is parsed as an integer.
 *
 * @param { String } str   The input string to be converted.
 * @param { String } [delimitor=' ']   The delimiter used to split the string. Defaults to a single space.
 * @returns { Array<number> }   An array containing the parsed integer values.
 */
function   toNumArray (   str ,   delimitor   =   ' '   )   {

    return   str .   split (   delimitor   ) .   map (   s   =>   parseInt (   s ,   10   )   )   ;

} // End of toNumArray function.


/**
 * Converts a string into an array of BigInts.
 * Similar to `toNumArray`, but uses `BigInt` for potentially larger numerical values.
 *
 * @param { String } str   The input string.
 * @param { String } [delimitor=' ']   The delimiter for splitting the string. Defaults to a space.
 * @returns { Array<BigInt> }   An array containing the parsed BigInt values.
 */
function   toBitIntArray (   str ,   delimitor   =   ' '   )   {

    return   str .   split (   delimitor   ) .   map (   s   =>   BigInt (   s   )   )   ;

} // End of toBitIntArray function.


/**
 * Transforms an array of strings into a 2-dimensional array (matrix).
 * Each string in the input array represents a row and is split by a delimiter.
 *
 * @param { Array<String> } array   An array of strings, where each string is a row.
 * @param { String } [delimitor=' ']   The delimiter used to split each row string. Defaults to a space.
 * @returns { Array<Array<String>> }   A 2D array (matrix) of strings.
 */
function   toMatrix (   array ,   delimitor   =   ' '   )   {

    const   result   =   array .   map (   v   =>   v .   split (   delimitor   )   )   ;

    return   result   ;

} // End of toMatrix function.


/**
 * Calculates the sum of all numerical elements within a given array.
 * Utilizes the `reduce` method for efficient summation.
 *
 * @param { Array<Number> } n   A numerical array whose elements are to be summed.
 * @returns { Number }   The total sum of all numbers in the array.
 */
function   sum (   n   )   {

    return   n .   reduce (   (   a ,   b   )   =>   a   +   b   )   ;

} // End of sum function.