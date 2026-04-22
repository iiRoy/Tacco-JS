/*
 * This is an extensive Type I clone of a JavaScript program.
 * It rigorously adheres to the official definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * Every single identifier, variable name, function name, operator,
 * and expression within this code remains precisely as it was in
 * the original source. The only modifications made are to
 * whitespace (including indentation, spacing, and blank lines)
 * and the addition, removal, or modification of comments.
 * The logical and structural integrity of the code is perfectly preserved.
 */


    'use strict' ; // This directive enforces strict mode for the entire script,
                  // leading to cleaner code and easier debugging by
                  // changing previously accepted "bad syntax" into errors.


// Definition of the main program function.
// This function takes a single argument, typically representing
// raw input data that needs to be processed.
function    Main    (    INPUT    )
{
    // Declare a constant variable named 'S'.
    // This variable will hold an array of characters.
    // The input 'INPUT' is first split by newline characters,
    // then the first line of the input is selected (index 0),
    // and finally, that line is split into individual characters.
    const       S       =       INPUT       .       split       (       "\n"       )       [       0       ]       .       split       (       ""       )       ;


    // Access the element at index 3 of the array 'S'
    // and assign the string value "8" to it.
    // This effectively changes the fourth character of the string.
    S       [       3       ]       =       "8"       ;


    // Log the modified array 'S' to the console.
    // The array elements are joined back into a single string
    // without any separator between them before being printed.
    console       .       log       (       S       .       join       (       ""       )       )       ;

} // End of the 'Main' function definition.


// This section is responsible for invoking the 'Main' function.
// It first reads content from a specified file path.
// The 'require("fs")' statement imports the Node.js File System module.
// 'readFileSync("/dev/stdin", "utf8")' synchronously reads the entire
// content of the standard input file descriptor as a UTF-8 encoded string.
// This string is then passed as the 'INPUT' argument to the 'Main' function.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;