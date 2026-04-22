/*
 * This JavaScript file processes input data,
 * removes duplicate entries, and then prints
 * the count of unique entries.
 *
 * This script is designed to be run in a Node.js environment,
 * as it utilizes the 'fs' module to read from standard input.
 */

// Define the main function that orchestrates the data processing logic.
// It takes a single argument, 'input', which is expected to be a string.
function   main (   input   )   {

    // The 'input' parameter initially holds the raw string data.
    // It's then re-assigned within this function's scope.
    // First, split the input string by newline characters to obtain an array of lines.
    // Each line in the original input string becomes an element in this new array.
    var   input   =   input.split (   "\n"   )   ;


    // Next, modify the 'input' array by slicing it.
    // The slice method is used here to create a new array containing elements
    // from index 1 (the second element) up to, but not including,
    // 'input.length + 1'. This effectively removes the very first element
    // of the array and keeps all subsequent elements.
    // This is often done when the first line of input is a header or count that's not needed.
    input   =   input.slice (   1   ,   input.length   +   1   )   ;


    // Declare a new variable, 'input_rmdup' (input_removed_duplicates),
    // to store the unique elements from the processed 'input' array.
    // The 'filter' method is employed here to iterate through the 'input' array
    // and construct a new array containing only unique elements.
    var   input_rmdup   =   input.filter (   (   n   ,   i   ,   array   )   =>   {

        // The core logic of the filter function:
        // For each element 'n' at index 'i' within the 'array',
        // it checks if the first occurrence of 'n' within 'array'
        // is exactly at the current index 'i'.
        // If 'array.indexOf(n) == i' is true, it means this is the first time
        // we've encountered this particular value 'n', making it unique so far.
        // If false, it's a duplicate, and it will be excluded from the new array.
        return   array.indexOf (   n   )   ==   i   ;

    }   )   ;


    // Finally, after filtering out all duplicate entries,
    // log the count of the unique elements to the console.
    // 'input_rmdup.length' gives the number of unique items.
    // 'parseInt' is used here, though '.length' property is already an integer,
    // ensuring the output is explicitly treated as an integer.
    console.log (   parseInt (   input_rmdup.length   )   )   ;

}   ; // End of the main function definition.

// This is the primary execution line of the script.
// It serves as the entry point when the script is run.
// 1. 'require('fs')' loads Node.js's built-in File System module.
// 2. '.readFileSync('/dev/stdin', 'utf8')' reads the entire content
//    of the standard input stream ('/dev/stdin') synchronously.
//    The 'utf8' encoding is specified for the input data.
// 3. The content read from stdin (which is a string) is then passed
//    as an argument to the 'main' function, initiating the data processing.
main (   require (   'fs'   ) .readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;