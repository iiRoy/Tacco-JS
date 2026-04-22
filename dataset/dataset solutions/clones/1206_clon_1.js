/*
 * This JavaScript code snippet is designed to read a line
 * from standard input, typically used in competitive programming
 * environments or shell scripting with Node.js.
 * It uses the 'fs' module for file system operations.
 */

// Declare a variable 'x' and assign it the content read from /dev/stdin.
// The content is read synchronously and decoded as UTF-8.
var     x    =    require ( 'fs' ) . readFileSync (    '/dev/stdin'    ,    'utf8'    ) ;


// Declare another variable 'len'.
// It will store an array of strings, obtained by splitting 'x' by spaces.
var    len    =    x . split ( " " ) ;       // Split the input string 'x' by space delimiter


/*
 * Reassign 'len' to a new array.
 * This new array will contain the integer representation of each string
 * element from the previous 'len' array.
 * The 'map' function is used for this transformation, applying parseInt to each element.
 */
len    =    len . map (    v    =>    parseInt (    v    )    ) ;    // Convert each string element to an integer