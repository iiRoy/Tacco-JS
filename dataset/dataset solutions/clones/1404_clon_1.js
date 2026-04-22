// This is a self-executing anonymous function, also known as an IIFE (Immediately Invoked Function Expression).
// It encapsulates the logic to prevent global scope pollution.
( function  (   input   )   {

    // The input is initially a single string read from standard input.
    // It's split by newline characters to create an array where each element is a line from the input.
    input   =   input    .    split    (    "\n"    )    ;

    /*
     * The problem specifies that the relevant data is on the second line of input.
     * Arrays are zero-indexed, so input[1] refers to the second line.
     * This line is then split by spaces to obtain an array of individual data elements.
     */
    var     data    =   input    [    1    ]    .    split    (    " "    )    ;

    // The 'reverse()' method is called on the 'data' array.
    // This method reverses the order of the elements in the array in-place.
    data    .    reverse    (    )    ; // After this, the first element becomes the last, and vice-versa.

    // Finally, the elements of the reversed 'data' array are joined back into a single string.
    // They are separated by a space character, as specified by the argument to 'join()'.
    // The resulting string is then printed to the console's standard output.
    console    .    log    (    data    .    join    (    " "    )    )    ;

// This closing parenthesis marks the end of the function definition.
// The next part is the invocation of the function, passing an argument to its 'input' parameter.
} ) (

    // This expression reads the content of '/dev/stdin' (standard input) synchronously.
    // The 'fs' module (File System) is required to access file system operations.
    // 'readFileSync' reads the entire file at once.
    // 'utf8' specifies the character encoding for the input data.
    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )

) ; // The semicolon terminates the entire IIFE statement.