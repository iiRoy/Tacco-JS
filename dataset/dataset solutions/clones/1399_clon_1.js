/*
 * This script serves as a basic calculator that reads mathematical expressions
 * from standard input, evaluates them, and prints the integer part of the result.
 * It continues processing lines until a specific termination condition is met.
 */

// Import the 'fs' (file system) module to enable reading from files,
// specifically '/dev/stdin' which represents standard input on POSIX systems.
// The entire content of '/dev/stdin' is read synchronously and decoded as UTF-8.
var      input    =    require('fs')   .   readFileSync   (    '/dev/stdin'    ,    'utf8'    )   ;

// Take the raw input string and split it into an array of individual lines.
// Each element in the 'lines' array will correspond to one line from the input.
var      lines     =     input     .     split     (     '\n'     )     ;



// Start an indefinite loop to process each line from the input array.
// This loop will continue running until an explicit 'break' statement is encountered.
while    (    true    )    {
    // Retrieve the first line from the 'lines' array and remove it from the array.
    // If the array becomes empty, 'shift()' will return 'undefined'.
    var     line     =     lines     .     shift     (     )     ;

    // Check a specific condition for termination:
    // If the current line, when split by a space, has its second token equal to '?',
    // it signals that processing should stop.
    if    (    line     .     split     (     ' '     )     [1]     ==     '?'    )
        break    ;    // Exit the 'while' loop immediately.

    // If the termination condition is not met,
    // evaluate the current 'line' as a JavaScript expression.
    // The result of this evaluation is then passed to Math.floor() to get the
    // largest integer less than or equal to the result.
    // Finally, this integer value is printed to the console.
    console     .     log     (     Math     .     floor     (     eval     (     line     )     )     )     ;
}

/*
 * Script execution has completed. All relevant lines have been processed
 * or the termination condition was met.
 */