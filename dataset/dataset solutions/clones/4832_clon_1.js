/*
 * This file contains utility functions for array manipulation and input parsing.
 * It also includes a main function that solves a specific problem using Union-Find.
 * Generated as a Type I clone, focusing on varying whitespace and comments.
 */

// Function to create a 2D array (matrix) filled with zeros.
// If 'x' is not provided, the matrix will be square (y x y).
function    ary2    (   y    ,    x    )
{
    /* If 'x' is undefined or null, assign it the value of 'y'.
     * This makes the matrix square by default.
     */
    x    =    x    ||    y ;

    // Create an array of 'y' elements, fill it with 0,
    // then map each element to a new array of 'x' elements, also filled with 0.
    return    Array    (    y    )
        .    fill    (    0    )
        .    map    (
            a    =>    Array    (    x    )    .    fill    (    0    )
        ) ;
} // End of ary2 function definition

/**
 * @class gets
 * @description A constructor function for an input stream reader.
 *              It takes a string, splits it by newlines, and provides methods
 *              to read tokens, lines, or matrices.
 * @param {string} str The input string to parse.
 */
function gets (   str   )
{
    // Store the input string, split by newline characters.
    // This creates an array where each element is a line from the input.
    this    .    _s    =    str    .    split    (    "\n"    ) ;

    // Initialize the line pointer to the first line (index 0).
    this    .    _y    =    0 ;
} ; // End of gets constructor

// Define methods for the 'gets' prototype.
gets    .    prototype    =
    {
        /**
         * Reads a single token from the current line.
         * If the line is exhausted, it moves to the next line.
         *
         * @param {boolean} f If true, returns the token as a string; otherwise, as a number.
         * @returns {string|number} The read token.
         */
        a : function ( f )
        {
            // Get a reference to the internal split string array and current line index.
            var    s    =    this    .    _s    ,
                y    =    this    .    _y    ,
                r ; // Variable to store the result.

            /* Check if the current line is still a string.
             * If it is, split it into tokens and reverse the array
             * so 'pop()' can efficiently get tokens from the beginning of the line.
             */
            if    (    typeof    s    [    y    ]    ===    "string"    )
            {
                s    [    y    ]    =    s    [    y    ]    .    split    (    " "    )    .    reverse    (    ) ;
            }

            // Pop the last element (which was originally the first) from the token array.
            r    =    s    [    y    ]    .    pop    (    ) ;

            // If the current line is now empty, advance to the next line.
            if    (    !    s    [    y    ]    .    length    )
            {
                this    .    _y    ++ ;
            }

            // Return the token, converting to number if 'f' is false (or falsy).
            return    f    ?    r    :    +    r ;
        } ,

        // Alias for the 'a' method.
        one : function ( f )
        {
            return    this    .    a    (    f    ) ;
        } ,

        // Another alias for the 'a' method.
        single : function ( f )
        {
            return    this    .    a    (    f    ) ;
        } ,

        /**
         * Reads an entire line of tokens.
         *
         * @param {boolean} f If true, returns tokens as strings; otherwise, as numbers.
         * @returns {Array<string|number>} An array of tokens from the current line.
         */
        l : function ( f )
        {
            var    s    =    this    .    _s    ,
                y    =    this    .    _y ;

            /* If the current line is a string, split it into tokens.
             * Otherwise, it's already an array (from a previous 'a' call),
             * so just reverse it to restore original order.
             */
            s    [    y    ]    =    typeof    s    [    y    ]    ===    "string"
                ?    s    [    y    ]    .    split    (    " "    )
                :    s    [    y    ]    .    reverse    (    ) ;

            // Advance to the next line.
            this    .    _y    ++ ;

            // Return the tokens, mapping to numbers if 'f' is false.
            return    f    ?    s    [    y    ]    :    s    [    y    ]    .    map    (    a    =>    +    a    ) ;
        } ,

        // Alias for the 'l' method.
        line : function ( f )
        {
            return    this    .    l    (    f    ) ;
        } ,

        // Another alias for the 'l' method.
        row : function ( f )
        {
            return    this    .    l    (    f    ) ;
        } ,

        /**
         * Reads a matrix (multiple lines) of tokens.
         *
         * @param {number} n The number of lines to read.
         * @param {boolean} f If true, returns tokens as strings; otherwise, as numbers.
         * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
         */
        m : function ( n , f )
        {
            var    s    =    this    .    _s    ,
                y    =    this    .    _y    ,
                r    =    [    ]    ,
                i    =    0 ;

            /* If 'f' is true, read lines and split them into string arrays.
             * Otherwise, read lines, split them, and map tokens to numbers.
             */
            if    (    f    )
            {
                for    (    ;    i    <    n    ;    i    ++    )
                {
                    r    [    i    ]    =    s    [    y    +    i    ]    .    split    (    " "    ) ;
                }
            }
            else
            {
                for    (    ;    i    <    n    ;    i    ++    )
                {
                    r    [    i    ]    =    s    [    y    +    i    ]    .    split    (    " "    )    .    map    (    a    =>    +    a    ) ;
                }
            }

            // Advance the line pointer by 'n' lines.
            this    .    _y    +=    n ;
            return    r ;
        } ,

        // Alias for the 'm' method.
        matrix : function ( n , f )
        {
            return    this    .    m    (    n    ,    f    ) ;
        } ,

        /**
         * Reads input to populate a specific type of 2D array (adjacency list/matrix).
         * This function seems to be for counting connections in a graph.
         *
         * @param {number} n The maximum index for the first dimension (used to size the result array).
         * @param {number} m The number of lines to read for connections.
         * @returns {Array<Array<number>>} A 2D array representing counts.
         */
        ary : function ( n , m )
        {
            var    s    =    this    .    _s    ,
                y    =    this    .    _y    ,
                r    =    ary2    (    n    +    1    ) ; // Initialize a 2D array with appropriate size.

            // Loop 'm' times to read 'm' connection lines.
            for    (    var    i    =    0    ;    i    <    m    ;    i    ++    )
            {
                // Split the current line into two tokens (e.g., node A, node B).
                var    t    =    s    [    y    +    i    ]    .    split    (    " "    ) ;
                // Increment the count at the specified coordinates in the result array.
                // Note: 't[0]' and 't[1]' are strings here, but JavaScript will implicitly convert them to numbers for array indexing.
                r    [    t    [    0    ]    ]    [    t    [    1    ]    ]    ++ ;
            }

            // Advance the line pointer by 'm' lines.
            this    .    _y    +=    m ;
            return    r ;
        } ,
    } ; // End of gets.prototype

// Global arrays for Union-Find data structures.
var    a    =    [    ]    ,
    b    =    [    ] ;

/**
 * Finds the root of an element 'x' in a Union-Find set 'a' using path compression.
 * @param {Array<number>} a The parent array representing the Union-Find set.
 * @param {number} x The element to find the root for.
 * @returns {number} The root of element 'x'.
 */
function    root    (    a    ,    x    )
{
    return    a    [    x    ]    ===    x    ?    x    :    (    a    [    x    ]    =    root    (    a    ,    a    [    x    ]    )    ) ;
}

/**
 * Checks if two elements 'x' and 'y' belong to the same set in Union-Find.
 * @param {Array<number>} a The parent array.
 * @param {number} x The first element.
 * @param {number} y The second element.
 * @returns {boolean} True if they are in the same set, false otherwise.
 */
function    same    (    a    ,    x    ,    y    )
{
    return    root    (    a    ,    x    )    ===    root    (    a    ,    y    ) ;
}

/**
 * Unites the sets containing elements 'x' and 'y' in Union-Find.
 * @param {Array<number>} a The parent array.
 * @param {number} x The first element.
 * @param {number} y The second element.
 */
function    unite    (    a    ,    x    ,    y    )
{
    x    =    root    (    a    ,    x    ) ;
    y    =    root    (    a    ,    y    ) ;
    if    (    x    ===    y    )    return ; // Already in the same set, do nothing.
    a    [    x    ]    =    y ; // Make 'y' the parent of 'x'.
}

// Create a new 'gets' object to read from standard input.
// This uses Node.js 'fs' module to read the entire stdin content.
var    o    =    new    gets    (
    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )
) ;

// Call the main function and print its return value to the console.
console    .    log    (    main    (    )    ) ;

/**
 * The main entry point of the program.
 * It reads input, performs Union-Find operations, and calculates an answer.
 * @returns {string} The final result, space-separated.
 */
function    main    (    )
{
    // Read three integer values from input.
    var    n    =    o    .    a    (    )    ,
        k    =    o    .    a    (    )    ,
        l    =    o    .    a    (    ) ;

    // Initialize Union-Find arrays 'a' and 'b'.
    // Each element is initially its own parent.
    for    (    var    i    =    0    ;    i    <=    n    ;    i    ++    )
    {
        a    [    i    ]    =    b    [    i    ]    =    i ;
    }

    // Process 'k' union operations for array 'a'.
    for    (    i    =    0    ;    i    <    k    ;    i    ++    )
    {
        var    t    =    o    .    l    (    ) ; // Read a line with two elements.
        unite    (    a    ,    t    [    0    ]    ,    t    [    1    ]    ) ;
    }

    // Process 'l' union operations for array 'b'.
    for    (    i    =    0    ;    i    <    l    ;    i    ++    )
    {
        t    =    o    .    l    (    ) ; // Reuse 't' variable.
        unite    (    b    ,    t    [    0    ]    ,    t    [    1    ]    ) ;
    }

    // Declare variables for intermediate results.
    var    u    =    [    ]    ,    // Array to store combined roots.
        v    =    {    }    ,    // Object (map) to count occurrences of combined roots.
        ans    =    [    ] ;    // Array to store the final answer.

    // Calculate combined roots and their frequencies.
    for    (    i    =    0    ;    i    <    n    ;    i    ++    )
    {
        // Concatenate roots from both Union-Find structures for each element (i+1).
        u    [    i    ]    =    root    (    a    ,    i    +    1    )    +    ","    +    root    (    b    ,    i    +    1    ) ;

        // Increment count for the combined root string in the 'v' map.
        if    (    v    [    u    [    i    ]    ]    )
        {
            v    [    u    [    i    ]    ]    ++ ;
        }
        else
        {
            v    [    u    [    i    ]    ]    =    1 ;
        }
    }

    // Populate the answer array using the frequencies.
    for    (    i    =    0    ;    i    <    n    ;    i    ++    )
    {
        ans    [    i    ]    =    v    [    u    [    i    ]    ] ;
    }

    // Join the answer elements with spaces and return the resulting string.
    return    ans    .    join    (    " "    ) ;
} // End of main function.