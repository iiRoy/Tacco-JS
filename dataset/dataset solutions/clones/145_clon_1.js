/*
 * This JavaScript program processes input from standard input (/dev/stdin).
 * It reads the entire content, splits it into blocks, and then for each block,
 * it performs a specific pattern matching operation to determine an output character.
 *
 * This is a Type I clone, meaning its functionality is identical to the original,
 * with only variations in whitespace and comments.
 */

// Core logic begins here:
require( "fs" ) // Access the Node.js File System module.
    .readFileSync(
          "/dev/stdin" // Specifies the path to the input file, in this case, standard input.
        , "utf8"       // Defines the character encoding to use when reading the file content.
    )
    /*
     * The content read from /dev/stdin is then split into an array of strings.
     * The split operation uses a regular expression `/\n\n/`, which means
     * it separates the content wherever two consecutive newline characters are found.
     * This effectively breaks the input into distinct paragraphs or blocks.
     */
    .split( /\n\n/ )
    // The `map` method is used to iterate over each block (`i`) obtained from the split operation.
    // For each block, a function is executed that processes the block and generates an output.
    .map(
        function (
            i // 'i' represents the current block of text being processed from the input.
        ) {
            // First, the original block of text is printed to the console.
            console.log( i )
            ;

            // A variable 'l' is declared (implicitly global, matching original behavior)
            // to store the calculated length based on a regex match.
            l =
                /1.*1/ // This regular expression looks for a '1', followed by any characters (zero or more), and then another '1'.
                    .exec(
                        // Before applying the regex, all whitespace characters (spaces, tabs, newlines)
                        // are removed from the current block 'i'.
                        i.replace( /\s/g , '' )
                    )
                    [0] // From the result of the `exec` method, we take the first element, which is the full matched string.
                    .length // Finally, we get the length of this matched string.
            ;

            // Based on the value of 'l' (the calculated length), a specific character is printed to the console.
            // This is achieved using a series of nested ternary operators, acting as a switch-like statement.
            console.log(
                  l == 10 // Is 'l' equal to 10?
                ? 'A'     // If yes, print 'A'.
                : l == 25 // Else, is 'l' equal to 25?
                ? 'B'     // If yes, print 'B'.
                : l == 4  // Else, is 'l' equal to 4?
                ? 'C'     // If yes, print 'C'.
                : l == 16 // Else, is 'l' equal to 16?
                ? 'D'     // If yes, print 'D'.
                : l == 11 // Else, is 'l' equal to 11?
                ? 'E'     // If yes, print 'E'.
                : l == 9  // Else, is 'l' equal to 9?
                ? 'G'     // If yes, print 'G'.
                : 'F'     // Otherwise (if none of the above conditions are met), print 'F'.
            )
            ;
        }
    )
; // End of the chain of operations.