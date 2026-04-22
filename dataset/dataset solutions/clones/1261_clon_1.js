/*
 *  This JavaScript file implements a solution to a problem
 *  that involves parsing structured input from standard input (stdin)
 *  and generating a series of ASCII art patterns based on the parsed data.
 *  The final output is then written to standard output (stdout).
 *
 *  The code utilizes chained method calls on array and string prototypes
 *  to achieve a functional and concise processing pipeline.
 */


const   res   =   require (   'fs'   )                                          //  Loads the Node.js 'fs' (file system) module.
                                                                                //  This module provides functionality for interacting with the file system.

                     .readFileSync (   '/dev/stdin'   ,   'utf8'   )           //  Synchronously reads the entire content of '/dev/stdin'.
                                                                                //  The 'utf8' encoding specifies how the raw bytes should be interpreted into a string.
                                                                                //  This is the starting point of our data processing chain.

    .match (   /^[\s\S]*?(?=\n0 0)/g   )                                        //  Applies a regular expression to the input string.
                                                                                //  The regex `^[\s\S]*?(?=\n0 0)` captures any character (`[\s\S]`)
                                                                                //  non-greedily (`*?`) from the beginning (`^`)
                                                                                //  until a line containing "0 0" is encountered (positive lookahead `(?=\n0 0)`).
                                                                                //  The `g` flag ensures all matches are found, returning an array of matches.

                                  [0]                                           //  Selects the first element from the array of matches.
                                                                                //  In this specific problem context, it's expected to be the only relevant match.


    .split (   '\n'   )                                                         //  Splits the extracted string content into an array of substrings.
                                                                                //  Each substring corresponds to a single line from the input,
                                                                                //  as delimited by the newline character `\n`.


    .map (   r   =>                                                             //  Applies a transformation function to each line (`r`) in the array.
        r . split (   ' '   )                                                   //  Inside the map, each line `r` is split by a space character.
                                                                                //  This separates numbers on a single line (e.g., "5 7" becomes ["5", "7"]).

            .map (   Number   )                                                 //  Further maps each resulting string segment to its numerical representation.
                                                                                //  So, `["5", "7"]` becomes `[5, 7]`.
                                                                                //  The result is an array of arrays, where each inner array is `[Height, Width]`.
    )


    .map (   (   [ H , W ]   )   =>   {                                         //  Processes each `[Height, Width]` pair obtained from the previous step.
                                                                                //  Array destructuring `[ H, W ]` conveniently assigns the first element to `H` and second to `W`.

        return   [   ...Array (   H   ) . keys ()   ]                          //  Generates an array of numbers from `0` up to `H-1`.
                                                                                //  This array represents the row indices for the grid we are about to construct.
                                                                                //  `Array(H)` creates an empty array of length H, `.keys()` returns an iterator of indices,
                                                                                //  and `...` spreads them into a new array.

            .map (   (   val ,   i ,   a   )   =>   {                           //  For each row index `i` (from `0` to `H-1`):
                                                                                //  `val` is the current index, `i` is the current index, `a` is the full array of indices.

                const   isBoundaryRow   =   (   !i   ||   i   ===   Math . max (   ...a   )   ) ;
                                                                                //  Determines if the current row `i` is either the first row (i.e., `i` is 0)
                                                                                //  OR the last row (i.e., `i` is equal to the maximum index in the array `a`).
                                                                                //  This condition is crucial for drawing the top and bottom borders.

                let   rowString   =   isBoundaryRow   ?   '#'   :   '.'   ;     //  Initializes the character that will be repeated for the current row.
                                                                                //  If it's a boundary row, it starts with '#'; otherwise, it starts with '.'.

                rowString   =   rowString . repeat (   W   )   ;                //  Repeats the `rowString` character `W` times to fill the entire width of the row.
                                                                                //  Example: if `W` is 5, it might become "#####" or ".....".

                return   rowString . replace (   / (^\.|\.$) /g   ,   '#'   )   ;
                                                                                //  Finally, adjusts the row to ensure the left and right borders are always '#'.
                                                                                //  The regex `(^\.|\.$)` matches a '.' at the beginning of the string (`^\.`)
                                                                                //  OR a '.' at the end of the string (`\.$`).
                                                                                //  If such a '.' is found, it's replaced with '#'.
                                                                                //  This ensures that even for inner rows (which start as all '.'),
                                                                                //  their first and last characters become '#'.
            }   )
            .join (   '\n'   )   ;                                              //  Joins all the individually generated row strings for the current grid.
                                                                                //  Each row is separated by a newline character, forming a complete ASCII art grid block.
    }   )


    .join (   '\n\n'   )                                                        //  Combines all the generated ASCII art grid blocks into a single string.
                                                                                //  Each grid block is separated by two newline characters (`\n\n`),
                                                                                //  effectively inserting a blank line between different grids.

    .concat (   '\n'   )   ;                                                    //  Appends a final newline character to the very end of the complete output string.
                                                                                //  This is a common practice to ensure that the output ends cleanly,
                                                                                //  especially in Unix-like environments or when piping output.


//  Outputs the final constructed string, which contains all the processed ASCII art grids,
//  to the standard output stream (console).
console . log (   res   )   ;