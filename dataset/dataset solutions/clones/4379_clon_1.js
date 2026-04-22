/*
 * This JavaScript file is designed to be executed in strict mode.
 * The "use strict" directive helps to enforce stricter parsing and error handling rules.
 * This can lead to safer and more robust code by catching common programming mistakes.
 */
"use strict"

/**
 * The main function processes a given input string.
 * It extracts characters at even indices (0, 2, 4, ...) and concatenates them.
 *
 * @param {string} input - The input string to be processed.
 */
function    main   (  input  )
{
    // First, the input string is transformed into an array of its individual characters.
    // For example, if input is "hello", it becomes ['h', 'e', 'l', 'l', 'o'].
    input    =    input . split ( "" )


    // A new variable, 'ans', is declared and initialized as an empty string.
    // This variable will accumulate the selected characters from the input.
    let   ans   =   ""


    // A for loop is used to iterate through the character array.
    // The loop condition ensures it covers roughly half the length of the array.
    // Math.ceil is used to correctly handle arrays with an odd number of elements,
    // ensuring the middle element (if applicable) is considered for index calculation.
    for  (
            let   i   =   0  ;                       // Initialize loop counter 'i' to 0.
            i   <   Math . ceil (  input . length   /   2  )  ;  // Loop continues as long as 'i' is less than half the array length (rounded up).
            i ++                                     // Increment 'i' by 1 in each iteration.
         )
    {
        // In each iteration, the character at index (i * 2) from the 'input' array is
        // appended to the 'ans' string. This effectively picks every second character.
        // E.g., for i=0, takes input[0]; for i=1, takes input[2]; for i=2, takes input[4], etc.
        ans   +=   input [  i   *   2  ]
    }


    // Finally, the accumulated string 'ans' is printed to the standard output.
    console . log (  ans  )
}

// This is the entry point of the script.
// It reads the entire content from standard input ("/dev/stdin") as a UTF-8 string.
// The read string is then passed as an argument to the 'main' function for processing.
main (  require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,  "utf8"  )  )