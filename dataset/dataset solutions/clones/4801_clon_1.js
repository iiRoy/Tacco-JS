/*
 * This script serves as the main entry point for the application.
 * It processes input received from standard input, specifically
 * evaluating the first line as a JavaScript expression.
 *
 * This is a demonstration of Type I code cloning, focusing solely
 * on modifications to whitespace and comments without altering
 * any functional code elements.
 */
'use strict'; // Activates strict mode, enhancing JavaScript quality.


// Defines the primary function 'main' which takes a single argument.
const   main   =   (   arg   )   =>   {

    // Processes the input:
    // 1. Removes leading/trailing whitespace using .trim().
    // 2. Splits the string into an array of lines using .split("\n").
    const   input   =   arg.trim().split(   "\n"   )   ;

    // Logs the result of evaluating the first line of input.
    // !!! CAUTION: Using 'eval()' with untrusted input can be a severe security risk.
    // It executes arbitrary code.
    console.log(   eval(   input[0]   )   )   ;

}; // End of the main function definition.


// Immediately invokes the 'main' function.
// It reads the entire content of standard input synchronously.
// 'require('fs')' loads the Node.js file system module.
// '.readFileSync('/dev/stdin', 'utf8')' reads from standard input
// with 'utf8' encoding, ensuring proper character interpretation.
main(   require(   'fs'   ).readFileSync(   '/dev/stdin'   ,   'utf8'   )   )   ;