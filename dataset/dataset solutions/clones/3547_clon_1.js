/*
 * This is a Type I clone of an original JavaScript file.
 * The purpose is to demonstrate extensive modifications to
 * whitespace and comments while preserving all code elements.
 *
 * All identifiers, keywords, operators, and expressions are
 * strictly maintained as per the Type I clone definition.
 */

// Declare a variable named 'input' and assign it the content
// read from '/dev/stdin' using the 'fs' module, encoded in 'utf8'.
var   input   =   require (   'fs'   ) . readFileSync (   '/dev/stdin'   ,   'utf8'   )   ;

// Print the raw 'input' string to the console.
console . log (   input   )   ;


// Declare another variable 'list' and initialize it by
// splitting the 'input' string at each space character.
var   list   =   input . split (   ' '   )   ;


// Define an arrow function named 'output'.
// This function encapsulates the core logic to determine the result.
var   output   =   (   )   =>     {
    // Begin the conditional block.
    // Check if the first element (index 0) or the second element (index 1)
    // of the 'list' array is strictly equal to the number 2.
    if   (   list [   0   ]   ===   2     ||     list [   1   ]   ===   2   )     {
        // If the condition is met, return the string 'No'.
        return   'No'   ;
    }

    // If the condition in the 'if' statement is not met,
    // then return the string 'Yes'.
    return   'Yes'   ;
}   ; // End of the 'output' function definition.

// Finally, call the 'output' function and print its returned value
// to the console. This will be either 'Yes' or 'No'.
console . log (   output (   )   )   ;

/*
 * End of the cloned JavaScript code.
 * All original functionality is preserved.
 */