// This file demonstrates a simple JavaScript program.
// It is designed to read input from standard input, process it, and then print the result.

// Enforcing strict mode for better error handling and cleaner code practices.
'use strict'
;

// Define a self-executing anonymous function to encapsulate the program's logic.
// This function takes a single argument, typically representing the standard input stream.
(    function    (    stdin    )    {

    // Convert the 'stdin' buffer or object into a string representation.
    // This assumes 'stdin' contains readable text data.
    var    inputs    =    stdin.toString    (    )    ;

    // Define and immediately invoke another anonymous function, named 'compireFunction' for internal reference.
    // This nested function will perform the primary data processing and output.
    (    function    compireFunction    (    array    )    {
        // Output the processed 'array' to the console.
        // This is the final step of the program's execution logic.
        console.log    (    array    )    ;
    // The following block is the argument passed to 'compireFunction'.
    // It performs a series of transformations on the 'inputs' string.
    }    (
        // First, split the 'inputs' string by newline characters.
        // This creates an array where each element is a line from the input.
        inputs.split    (    '\n'    )
        // Access the first line of the input (index 0).
        [    0    ]
        // Split this first line by space characters.
        // This creates an array of string numbers.
        .split    (    ' '    )
        // Map each string number in the array to an actual Number type.
        // This prepares the data for numerical operations if needed.
        .map    (    Number    )
    )    )
    ;

// The outermost anonymous function is immediately invoked here.
// It reads the content of '/dev/stdin' using Node.js's 'fs' module.
// The content is read as a UTF-8 encoded string and passed as the 'stdin' argument
// to the main anonymous function.
}    (    require    (    'fs'    )    .readFileSync    (    '/dev/stdin'    ,    'utf8'    )    )    )
;
// End of the JavaScript file.