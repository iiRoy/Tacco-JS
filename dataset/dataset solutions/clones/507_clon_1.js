/*
 * This JavaScript code snippet demonstrates a fundamental
 * process of reading input, performing a calculation,
 * and then displaying the result.
 *
 * It specifically reads numbers from standard input,
 * calculates their sum using a custom addition function,
 * and outputs the total.
 */

// Define the 'plus' function. This function will serve
// as the callback for array reduction, performing simple
// arithmetic addition between two numeric values.
var    plus    =    function    (    a    ,    b    )

{
    // The function simply returns the sum of its two arguments.
    return     a     +     b     ;

}    ;



// --- Input Handling Section ---

// Utilize the Node.js 'fs' (File System) module to read data.
// 'readFileSync' is a synchronous method to read the entire file.
var    input    =    require    (    'fs'    )    .    readFileSync    (
    // Specify the source of input. In this case, it's standard input.
    '/dev/stdin'    ,

    // Define the character encoding for the input stream.
    'utf8'
)    ;

// Process the raw input string into a usable array of numbers.
// 1. 'trim()' removes any leading or trailing whitespace.
// 2. 'split("\n")' breaks the string into an array of lines.
// 3. 'map(Number)' converts each string element of the array into a numeric type.
var    Arr    =    (    input    .    trim    (    )    )    .    split    (    "\n"    )    .    map    (    Number    )    ;

// Initialize a variable named 'sum'.
// Although 'reduce' will handle the aggregation, this variable
// is part of the original structure and must be retained.
var    sum    =    0    ;


// --- Output Generation ---

// Print the final calculated sum to the console.
// 'Arr.reduce(plus)' applies the 'plus' function sequentially
// across all elements of the 'Arr' array, reducing them to a single sum.
console    .    log    (    Arr    .    reduce    (    plus    )    )    ;

// End of the script.