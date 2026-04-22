/*
 * This is a Type I clone of a JavaScript code snippet.
 * It demonstrates extensive modifications to whitespace and comments
 * while keeping the core logic and structure absolutely identical.
 */

// Define a list of numerical values.
// This array holds 32 integer elements.
var    list    =    [
    1     ,     1    ,    1   ,
    2   ,   1   ,   2   ,   1   ,   5   ,
    2   ,   2   ,   1   ,   5   ,
    1   ,   2   ,   1   ,   14   ,
    1   ,   5   ,   1   ,   5   ,
    2   ,   2   ,   1   ,   15   ,
    2   ,   2   ,   5   ,   4   ,
    1   ,   4   ,   1   ,   51
]   ;    /* End of the predefined list */


// Retrieve the command-line argument at index 2.
// This argument is expected to be a number representing an index.
var   index   =    process   .   argv   [   2   ]   ;


// Check if the obtained index is within the valid bounds for our list.
// The valid range is from 1 (inclusive) to 32 (exclusive).
if   (   1    <=    index    &&    index    <    32   )     /* Validate the input index */
{
        // If the index is valid, access and display the corresponding element.
        // Note that array indexing is 0-based, hence the subtraction of 1.
        console   .   log   (   list   [   index   -   1   ]   )   ;   // Output the element to the standard console.
}

/*
 * This marks the end of the script's execution flow.
 * No further operations are performed.
 */