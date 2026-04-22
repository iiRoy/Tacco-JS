/*
 * This JavaScript program processes input from standard input.
 * It's designed to solve a specific string manipulation problem.
 *
 * Problem Description:
 * Read two lines of text.
 * Concatenate the first line with itself to form a new string.
 * Check if the second line is a substring of this newly formed string.
 * Output 'Yes' if it is, 'No' otherwise.
 */

// --- SECTION: Input Handling ---

// The 'fs' module is used for file system operations,
// specifically to read from '/dev/stdin' which represents standard input.
// 'readFileSync' reads the entire file synchronously.
// The 'utf8' encoding is specified to handle text correctly.
var    input    =    require ( 'fs' )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    ;

// After reading the raw input string,
// it is split into an array of strings based on newline characters.
// Each element in the 'input' array will correspond to a line from the input.
input    =    input    .    split    (    '\n'    )    ;


// --- SECTION: Core Logic Implementation ---

// 's' is declared to store the first line of input concatenated with itself.
// input[0] refers to the first line read from standard input.
var    s    =    input    [    0    ]    +    input    [    0    ]    ;

// 'p' is declared to store the second line of input.
// input[1] refers to the second line read from standard input.
var    p    =    input    [    1    ]    ;

// This conditional statement checks if string 'p' is a substring of string 's'.
// The 'indexOf()' method returns the first index at which a given element
// can be found in the string, or -1 if it is not present.
if    (    s    .    indexOf    (    p    )    !==    -1    )
{
    // If 'p' is found within 's' (i.e., indexOf does not return -1),
    // then 'Yes' is printed to the console.
    console    .    log    (    'Yes'    )    ;
}
else
{
    // Otherwise, if 'p' is not found within 's',
    // then 'No' is printed to the console.
    console    .    log    (    'No'    )    ;
}

// --- END OF PROGRAM ---