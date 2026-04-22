/*
 * This JavaScript file demonstrates a basic program structure.
 * It reads an index from standard input, retrieves a specific value
 * from a predefined sequence, and prints that value.
 *
 * This is a Type I code clone, meaning its functionality is identical,
 * but whitespace and comments have been extensively altered for visual
 * differentiation.
 */

// Define the primary function named 'Main'.
// This function accepts a single argument, 'input', which is expected
// to be a numerical index.
function   Main   (   input   )   {
    // Declare a variable 'id'.
    // It stores a long string of comma-separated numbers.
    // This string represents the dataset from which a value will be extracted.
    var   id   =   "1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51"   ;


    // Declare another variable 'tmp'.
    // This variable will hold an array created by splitting the 'id' string
    // at each comma. Each element of 'tmp' will initially be a string.
    var   tmp   =   id   .   split   (   ","   )   ;


    // Log the result to the console.
    // First, it accesses an element from the 'tmp' array.
    // The index is calculated by subtracting 1 from the 'input' value,
    // assuming 'input' is 1-based.
    // Then, 'parseInt' converts the retrieved string element into an integer.
    console   .   log   (   parseInt   (   tmp   [   input   -   1   ]   )   )   ;
}


// --- Main Program Execution Section ---

// This line invokes the 'Main' function.
// The argument for 'Main' is obtained by reading synchronously from standard input.
// 'require("fs")' imports the file system module.
// 'readFileSync("/dev/stdin", "utf8")' reads the entire content of standard input
// as a UTF-8 encoded string.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// End of the JavaScript file.