/*
 * This JavaScript file contains a main function
 * designed to process some input.
 * It takes a string, processes it, and prints a result.
 */


const   main    =   (   input   )   =>
{
    // Declare an array to hold the first characters of processed words.
    // We are destructuring the array returned by the processing steps.
    const   [   a   ,   b   ,   c   ]   =
        input
            .   trim    (   )   // Remove leading/trailing whitespace from the input string.
            .   split   (   ' ' )   // Split the string by spaces into an array of words.
            .   map     (   s   =>
                                s   .   charAt  (   0   )   // Get the first character of each word.
                                    .   toUpperCase (   )   // Convert that character to uppercase.
                            )   // Map each word to its uppercase first character.
    ;   // End of variable declaration.

    // Output the concatenated first characters to the console.
    console .   log (   a   +   b   +   c   )   ;
}   ;   // End of the main function definition.


// --- Standard Input Handling ---

// The following line reads the standard input and passes it to the main function.
// It uses the built-in 'fs' module to perform file system operations.
main    (
            require (   "fs"    )   // First, get the file system module.
                .   readFileSync    (
                                        "/dev/stdin"    ,   // Specify the path to standard input.
                                        "utf8"              // Specify the encoding for reading the file.
                                    )   // Read the content of the standard input file.
        )   ; // Call the main function with the read content.