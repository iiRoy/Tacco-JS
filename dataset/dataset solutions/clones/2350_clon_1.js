/*
 * This JavaScript program processes an input string to calculate a specific value.
 * It identifies characters that are not palindromic in nature within the string.
 */

// Define the main function that accepts a single input parameter.
function   Main (   input   )
{
    // The trim() method returns a new string with whitespace removed from both ends.
    // However, in this specific context, the return value is not assigned back to 'input',
    // and 'input' is immediately overwritten in the next line.
    // Therefore, this line effectively has no impact on the subsequent logic.
    input  .  trim ( ) ;

    // Convert the input string into an array of individual characters.
    // This allows for character-level manipulation.
    input   =   input . split ( "" ) ;

    // Create a reversed copy of the character array.
    // First, slice() creates a shallow copy, then reverse() modifies that copy.
    var   output   =   input . slice ( ) . reverse ( ) ;

    // Initialize a counter with the total number of characters in the input.
    var   count   =   input . length ;

    // Begin a loop that iterates through each character of the original input array.
    for ( var   i = 0 ;   i < input . length ;   i ++ )
    {
        // Compare the character at the current index 'i' in the original array
        // with the character at the same index 'i' in the reversed array.
        if (   input [ i ]   ==   output [ i ]   )
        {
            // If the characters match, it means this character is in a "palindromic" position
            // relative to the string's center, so we decrement the counter.
            count -- ;
        }
    }

    // After the loop, 'count' holds the number of characters that did *not* match
    // their counterpart in the reversed string. Dividing by 2 gives the number
    // of unique positions where a mismatch occurred (since each mismatch is counted twice).
    console . log (   count / 2   ) ;
}

// This is the entry point of the script when run in a Node.js environment.
// It reads the entire content of the standard input ("/dev/stdin") as a UTF-8 string,
// and then passes that string to the Main function for processing.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ) ;