// This JavaScript file defines a function to process input and perform some calculations.
// It's designed to read from standard input, typically in a competitive programming context.

function   Main   (   input   )
{
    // The 'Main' function is the primary entry point for processing the given input string.

    input   =   input.split   (   " "   )   ;   // First, we split the input string by spaces.
                                            // This assumes the input consists of space-separated values.

    var   a   =   input[   0   ]   ;   // Declare a variable 'a' and assign it the first element
                                    // from the split input array. This will be a string.

    var   b   =   input[   1   ]   ;   // Declare a variable 'b' and assign it the second element
                                    // from the split input array. This will also be a string.


    // Now, we perform three arithmetic operations: addition, subtraction, and multiplication.
    // JavaScript's '+' operator can concatenate strings, but '-' and '*' will coerce operands to numbers.
    // 'math.max' is then used to find the largest result among these three operations.
    // The result is printed to the console.
    console.log   (   math.max   (   a   +   b,   a   -   b,   a   *   b   )   )   ;
}

// This line executes the 'Main' function.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string.
// This is a common pattern in environments like Node.js for competitive programming.
Main   (   require   (   "fs"   )   .readFileSync   (   "/dev/stdin",   "utf8"   )   )   ; // Function call to start the program.