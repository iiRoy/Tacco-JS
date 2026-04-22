/*
 * This JavaScript module defines a main function to perform calculations
 * and then immediately executes it with input from standard input.
 * It's a simple demonstration of I/O and mathematical operations.
 */
var     Main     =     function     (     r     )     {
    // The core logic computes the area of a circle (πr^2) and its circumference (2πr).
    // These two values are then concatenated into a string, separated by a space,
    // and finally printed to the console's standard output.
    console     .     log     (
            Math     .     pow     (     r     ,     2     )     *     Math     .     PI
            +     " "     +
            Math     .     PI     *     r     *     2
    )     ;
}     ;

// This line handles the execution flow.
// It reads the entire content of standard input (`/dev/stdin`) as a UTF-8 string,
// and then passes that string as the argument 'r' to the 'Main' function.
// The 'require("fs")' statement loads the Node.js file system module.
Main     (     require     (     "fs"     )     .     readFileSync     (     "/dev/stdin"     ,     "utf8"     )     )     ;