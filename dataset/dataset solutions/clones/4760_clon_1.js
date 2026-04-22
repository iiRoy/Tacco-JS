/*
 * This is a Type I clone of an original JavaScript program.
 * It strictly adheres to the definition of Type I cloning:
 * only whitespace and comments are altered.
 * All identifiers, operators, and expressions remain precisely as they were.
 * This ensures the program's functionality is identical.
 */

'use strict' // Enforce strict mode for better error handling and cleaner code.


/**
 * The main function processes the input string to calculate a maximum value
 * based on a sequence of 'I' (increment) and 'D' (decrement) operations.
 *
 * @param {string} input - The raw input string read from standard input.
 *                         It's expected that the first character is a number
 *                         representing the length of the sequence, followed
 *                         by 'I' or 'D' characters.
 */
function    main   (  input  )
{
    // Convert the input string into an array of individual characters.
    // This makes it easier to access characters by index.
    input =   input.split('');


    // The first element of the input array (input[0]) is assumed to be
    // a character representing the length of the sequence of operations.
    // JavaScript's type coercion will convert this character to a number
    // when it's used in a numeric context (e.g., in the loop condition).
    const   length  =   input[0];


    let res =   0; // Initialize a result counter. This variable will track the current value after operations.
    let list =  [   ]; // Initialize an empty list (array) to store all intermediate 'res' values.


    // Loop through the characters representing the operations.
    // The loop starts from index 0 and continues for 'length' iterations.
    // Note: The actual operation characters are at input[i + 1],
    // because input[0] was used for the length.
    for  ( let i = 0;  i < length; i++  )
    {
        /*
         * Check the character at the current index (i + 1) in the input array.
         * If the character is 'I', it signifies an increment operation.
         * Otherwise (if it's not 'I', presumably 'D' or any other character),
         * it signifies a decrement operation.
         */
        if  (   input[i + 1]  ==  'I'   )
        {
            res++; // Increment the result counter by one.
        }
        else // This block is executed if the character is not 'I'.
        {
            res--; // Decrement the result counter by one.
        }

        // After each operation (increment or decrement), add the current 'res' value
        // to our list of intermediate results.
        list.push(  res  );
    }


    // Once all operations have been processed and all intermediate results are collected,
    // find the maximum value within the 'list' array.
    // The spread operator (...) is used to pass array elements as individual arguments to Math.max().
    // Finally, print this maximum value to the console.
    console.log (   Math.max(   ...list   )   );
}


// This line is responsible for reading the input and initiating the program execution.
// It uses Node.js's built-in 'fs' (file system) module.
// 'require("fs").readFileSync("/dev/stdin", "utf8")' reads the entire content
// of the standard input stream ('/dev/stdin') as a UTF-8 encoded string.
// This string is then passed as an argument to the 'main' function.
main(   require("fs").readFileSync(  "/dev/stdin",  "utf8"  )   );

// End of JavaScript program.