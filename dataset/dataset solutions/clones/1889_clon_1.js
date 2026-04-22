/*
 * This is a JavaScript program designed to process a simple string input.
 * It demonstrates conditional logic based on the input string's value.
 *
 * The program reads a single line of text from standard input,
 * and based on its content, prints a different string to standard output.
 */

// Define the primary function of the application, named 'main'.
// This function accepts one argument, typically a string representing the raw input.
function   main    (    input    )
{
    // Declare a variable 's' to store the processed input.
    // The 'input' string is first split by newline characters.
    // We then access the very first element (at index 0) of the resulting array,
    // effectively taking only the first line of the input.
    var    s    =    input . split ( "\n" )    [ 0 ]    ;


    // Initiate a conditional block to check the value of 's'.
    // If 's' is strictly equal to the string literal "ABC"...
    if    (    s    ==    "ABC"    )
    {
        // ...then, print the string "ARC" to the console (standard output).
        console . log ( "ARC" )    ;
    }
    // Otherwise, if the condition in the 'if' statement is false (i.e., 's' is not "ABC")...
    else
    {
        // ...then, print the string "ABC" to the console (standard output).
        console . log ( "ABC" )    ;
    }
}

// --- Program Execution Section ---

// This line executes the 'main' function.
// It first reads the entire content of '/dev/stdin' (standard input file descriptor on Unix-like systems)
// using Node.js's 'fs' (file system) module.
// 'readFileSync' is used for synchronous reading, and 'utf8' specifies the character encoding.
// The result of this file read operation (the input string) is then passed as an argument to 'main'.
main    (    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' )    )    ;

// End of the script.