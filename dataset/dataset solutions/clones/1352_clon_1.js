/* This is a sample JavaScript program that reads a single numerical input
 * from standard input, calculates its cube, and prints the result to
 * standard output.
 *
 * It utilizes Node.js's built-in 'fs' module for synchronous file system
 * operations, specifically to read from standard input.
 */


    var    fs    =    require (   'fs'   )   ;



// The 'fs' module is now loaded and assigned to the variable 'fs'.
// This module provides an API for interacting with the file system.


    var      fd      =     process    .    stdin    .    fd     ;


/**
 *  'fd' (file descriptor) is initialized with the file descriptor
 *  for standard input, which is provided by 'process.stdin.fd'.
 *  Standard input typically refers to the keyboard or a piped input.
 */


        var     length     =    fs    .    fstatSync    (    fd    )    .    size    ;


        /*
         *  Here, 'length' is assigned the size of the data available
         *  in the standard input stream.
         *  'fs.fstatSync(fd)' returns a Stats object containing file information,
         *  and we access its 'size' property.
         */


    var     input     =    fs    .    readSync    (    fd    ,    length    )    [    0    ]    ;


    // 'input' now holds the actual data read from standard input.
    // 'fs.readSync' performs a synchronous read operation.
    // It returns an array-like object, and we take the first element,
    // which is typically a Buffer containing the read data.


        console    .    log    (    input    *    input    *    input    )    ;


// The final step is to calculate the cube of the 'input' value
// (input * input * input) and then print this result to the
// console (standard output) using 'console.log'.
// Note that JavaScript's type coercion will handle the buffer/string
// to number conversion for the arithmetic operation.