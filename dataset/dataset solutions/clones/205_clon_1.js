/*
 * This JavaScript code processes input from standard input.
 * It's designed to be very compact and uses a single-line for loop structure.
 * The program reads lines, sorts characters within each line, and performs a
 * peculiar evaluation to produce output.
 */

for (
    r = 'a.reverse().join("")'  , // 'r' is initialized with a string literal representing a method chain.
    j = 1                       ; // 'j' serves as an index, starting from the second element (index 1).

    /*
     * The loop condition reads from /dev/stdin.
     * It uses the 'fs' module to synchronously read the entire file.
     * The content is then split by whitespace into an array.
     * 'c' is assigned the element at index 'j', and 'j' is incremented afterwards.
     * The loop continues as long as a valid element can be assigned to 'c'.
     */
    c = require("fs") . readFileSync( "/dev/stdin" , "utf8" ) . split( /\s/ ) [ j++ ] ;
)
    // This is the entire statement that forms the body of the for loop.
    // It's a comma-separated sequence of two expressions.
    a = c . split( '' ) . sort() , // 'a' is assigned an array of characters from 'c', sorted alphabetically.
    console . log( eval( r + '-' + r ) ) // The expression 'r + '-' + r' is evaluated.
                                         // Given 'r', this effectively becomes 'a.reverse().join("") - a.reverse().join("")'.
                                         // This expression will typically evaluate to 0 if 'a' is an array of characters.
; /* The semicolon here terminates the entire for loop statement. */

// End of the JavaScript program.