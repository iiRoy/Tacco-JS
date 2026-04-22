/*
 * This JavaScript program reads input from stdin,
 * processes it to extract individual words, and then
 * prints the very first character of each word.
 *
 * This is a Type I clone, meaning only whitespace
 * and comments have been altered.
 */

// Declare a constant variable named 'input'.
// This variable will hold the content read from standard input.
const  input  =  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ; // Utilize the 'fs' module to synchronously read the file located at '/dev/stdin', interpreting its content as UTF-8 encoded text.


// Create another constant variable named 'words'.
// This array will store individual words parsed from the 'input' string.
const  words  =  input . split ( ' ' ) ; // The 'split' method is called on the 'input' string, using a single space character as the delimiter to break the string into an array of substrings (words).


// Iterate through each element (which is a 'word') in the 'words' array.
words . forEach ( word  =>  {
    // For every 'word' encountered during the iteration,
    // print its first character to the console.
    console . log ( word [ 0 ] ) ; // Accesses the character at index 0 of the current 'word' and outputs it to the standard output stream.
} ) ; // Concludes the iteration over the 'words' array.

// End of the program's main execution flow.