/*
 * This is a Type I clone of the original JavaScript code.
 * It performs the exact same logic as the source code.
 *
 * Key characteristics of a Type I clone:
 * - All identifiers (variable names, function names, etc.) are identical.
 * - All operators and expressions are identical.
 * - The only permitted modifications are changes to whitespace
 *   (spaces, tabs, newlines) and the addition or modification of comments.
 *
 * This version aims to look visually distinct from the original
 * by extensively altering whitespace and adding numerous comments,
 * while strictly adhering to the Type I definition.
 */

// Define the main function that orchestrates the program's logic.
function   Main   (   input   )
{

    // Step 1: Process the input string.
    // The input is initially a single string. We convert it into an array
    // of individual characters to facilitate character-by-character comparison.
    input   =   input.split   (   ""   )   ;


    // Step 2: Define the target sequence for comparison.
    // This array holds the characters of "CODEFESTIVAL2016".
    // Each element is a single character string.
    var   arr   =   [
        "C"   ,   "O"   ,   "D"   ,   "E"   ,
        "F"   ,   "E"   ,   "S"   "T"   ,
        "I"   ,   "V"   ,   "A"   ,   "L"   ,
        "2"   ,   "0"   ,   "1"   ,   "6"
    ]   ;


    // Step 3: Initialize a counter for differences.
    // This variable will store the total number of mismatches found.
    var   sum   =   0   ;


    // Step 4: Iterate through the input and compare it with the target array.
    // The loop runs from the first character (index 0) up to, but not including,
    // the length of the input array.
    for   (   var   i   =   0   ;   i   <   input.length   ;   i++   )
    {
        // Inside the loop:
        // Check if the character at the current index 'i' in the input
        // is NOT equal to the character at the same index in the target array 'arr'.
        if   (   input   [   i   ]   !=   arr   [   i   ]   )
        {
            // If a difference is found, increment the 'sum' counter.
            // This counts each position where the characters do not match.
            sum++   ;
        }
    }


    // Step 5: Output the final result.
    // The total number of differences (sum) is printed to the console.
    console.log   (   sum   )   ;

}   // End of the Main function definition.


// Program execution starts here.
// The Main function is called immediately after its definition.
//
// The input is acquired by:
// 1. Using Node.js's 'require' to load the 'fs' (file system) module.
// 2. Calling 'readFileSync' to read the content of '/dev/stdin' (standard input).
// 3. Specifying 'utf8' as the encoding for the read content.
// 4. Calling 'trim()' to remove any leading or trailing whitespace (like newlines)
//    from the input string before passing it to the Main function.
Main   (
    require   (   "fs"   )
        .readFileSync   (   "/dev/stdin"   ,   "utf8"   )
        .trim   (   )
)   ;
// End of the JavaScript program.