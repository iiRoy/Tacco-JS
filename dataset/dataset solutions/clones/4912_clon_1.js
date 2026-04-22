// This is an example of a Type I code clone generated from an original JavaScript snippet.
// All functional aspects, identifiers, variable names, and operators remain strictly identical.
// Only whitespace and comments have been altered to create visual distinction.

function   Main   (   input   )   {
    // The input string is first processed:
    // 1. Whitespace is removed from both ends using .trim().
    // 2. The string is then split into an array of substrings using a space as a delimiter.
    input    =    input.trim().split(" ");
    
    /*
     * Extract the numerical values from the processed input array.
     * parseInt is used to convert the string representations to integers,
     * with a radix of 10 specified for decimal conversion.
     */
    var   N    =    parseInt(   input[0],    10   ); // N represents the first number
    var   K    =    parseInt(   input[1],    10   ); // K represents the second number
    
    // Initialize a variable named 'sum' with the value of K.
    // This serves as the starting point for our calculation.
    var   sum    =    K;
    
    // Begin a loop that iterates N-1 times.
    // The loop counter 'i' starts at 1 and continues as long as 'i' is less than 'N'.
    for    (   var   i    =    1;    i    <    N;    i++   )
    {
        // In each iteration, the 'sum' is updated by multiplying it with (K - 1).
        // This is a compound assignment operator equivalent to: sum = sum * (K - 1);
        sum    *=    K    -    1;
    }
    
    // Finally, the calculated 'sum' is printed to the standard output.
    // console.log() is a standard JavaScript function for outputting messages.
    console.log(   sum   );
}


// This part of the code handles the execution environment setup.
// It reads input from standard input (typically /dev/stdin in competitive programming environments).
// 'require("fs")' loads the Node.js file system module.
// 'readFileSync' reads the entire content of the specified file synchronously.
// The content is read as "utf8" encoded text.
// The read content is then passed as an argument to the 'Main' function.
Main(   require("fs").readFileSync("/dev/stdin",    "utf8")   );

// End of the JavaScript program logic.