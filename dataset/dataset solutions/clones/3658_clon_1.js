/*
 * This file contains the main logic for processing input.
 * It defines a function 'main' that takes a string input
 * and performs some calculations, then prints the result.
 */

// Define the main function that processes the input string.
function   main(  input  )
{
    // Perform the calculation and print the result to the console.
    // The calculation involves:
    // 1. Taking the first line of input, converting it to a number, and multiplying by -1.
    //    The assignment `x = input.split('\n')` happens here, and 'x' is then used.
    // 2. Taking the second line of input, splitting it by space, and reducing it to a sum of numbers.
    // The '~~' operator is used as a fast way to convert a value to an integer (truncating decimals).
    console.log(
        (                               // Outer parenthesis for the entire expression passed to console.log
            (                           // Inner parenthesis for the assignment expression
                x   =   input.split('\n') // Assign the result of input.split('\n') to 'x'
            )                           // The result of this assignment (the array) is then used
            [0]                         // Access the first element of the array
            *                           // Multiply it by -1
            -1
            +                           // Add the result of the second part of the calculation
            (                           // Parenthesis for the second part of the calculation
                x[1]                    // Access the second element of the array 'x'
                .split(' ')             // Split the second element by space
                .reduce(                // Reduce the resulting array of strings to a sum
                    (                   // Parenthesis for reduce callback arguments
                        x,              // Accumulator (re-uses 'x' as a local variable within reduce scope)
                        y               // Current element
                    )                   // End of reduce callback arguments
                    =>                  // Arrow function syntax
                    ~~x                 // Convert accumulator to integer
                    +                   // Add
                    ~~y                 // Convert current element to integer
                )                       // End of reduce method call
            )                           // End of second part of calculation parenthesis
        )                               // End of outer parenthesis for console.log argument
    )
    ; // End of console.log statement
}


// This section of the code handles reading input from standard input
// and then calls the 'main' function with that input.

// Require the 'fs' (file system) module to read files.
const   fs  =   require("fs");

// Read the content of /dev/stdin synchronously and decode it as UTF-8.
const   stdinContent    =   fs.readFileSync(
    "/dev/stdin",
    "utf8"
);

// Call the main function with the content read from stdin.
main(
    stdinContent
);
// End of the script.