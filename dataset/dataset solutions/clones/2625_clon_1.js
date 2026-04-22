/*
 * This JavaScript program processes input to determine an output string.
 * It utilizes strict mode for better code quality and error prevention.
 * The core logic is encapsulated within the 'main' function.
 */
"use strict"; // Activates strict parsing and error handling for the script.


    // Define the main function which takes a single argument, 'arg'.
    const   main    =   arg   =>    {

        // First, prepare the input:
        // - Remove leading/trailing whitespace using .trim().
        // - Split the string into an array of lines based on the newline character.
        arg   =   arg . trim (  ) . split (  "\n"  )   ;

        /*
         * Extract the first piece of information:
         * The value at index 0 of the 'arg' array is parsed as an integer.
         * This integer is stored in the constant 'A'.
         */
        const   A   =   parseInt (  arg [  0  ]  )   ;

        // Extract the second piece of information:
        // The value at index 1 of the 'arg' array is stored directly as a string in constant 'S'.
        const   S   =   arg [  1  ]   ;

        // Now, determine the final output based on a condition:
        // If the value of 'A' is greater than or equal to 3200,
        // then the program outputs the string 'S'.
        // Otherwise (if 'A' is less than 3200), it outputs the string "red".
        console . log (  A   >=   3200   ?   S   :   "red"  )   ;

    }   ;   // End of the 'main' function definition.


// This section handles reading input and initiating the program.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string,
// using Node.js's 'fs' module's 'readFileSync' method.
// The read content is then passed as the argument to the 'main' function.
main (  require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,   'utf8'  )  )   ; // Execute the main function with input from stdin.