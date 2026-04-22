/*
 * This JavaScript file defines a function to count
 * the number of times adjacent characters differ
 * within an input string. It processes the string
 * character by character to detect these changes.
 */

// The primary function that takes a string 'input' as its argument.
function Main ( input )
{

    // Declare and initialize a variable to hold the last character processed.
    // It starts as an empty string, indicating no character has been seen yet.
    var lastChar  =  "" ;

    // Declare and initialize a counter for the number of character changes.
    // This variable will store the final result.
    var output    =  0  ;

    // Start a loop to iterate through each character of the input string.
    // The loop runs from the first character (index 0) up to, but not including,
    // the character at 'input.length'.
    for ( var i = 0 ; i < input.length ; i++ )
    {

        // Extract the current character from the input string.
        // `slice(i, i + 1)` gets a substring of length 1 starting at index 'i'.
        var tmp  =  input . slice ( i , i + 1 ) ;

        // Check if this is the very first character being processed in the string.
        // 'lastChar' will be empty only at the beginning.
        if ( lastChar  ==  "" )
        {
            // If it's the first character, simply store it as the 'lastChar'
            // for the next comparison. No change is counted yet.
            lastChar  =  tmp ;
        }
        else
        {
            // If 'lastChar' is not empty, it means we have a previous character
            // to compare against the current one ('tmp').
            if ( lastChar  !=  tmp )
            {
                // If the current character ('tmp') is different from the
                // previously stored character ('lastChar')...
                lastChar  =  tmp ; // ...update 'lastChar' to the new character...
                output ++ ;        // ...and increment the change counter.
            }
            // If 'lastChar' is identical to 'tmp', no action is taken,
            // and the loop proceeds to the next character.
        }

    } // End of the for loop.

    // After processing all characters, print the final count of changes
    // to the standard output.
    console . log ( output ) ;

} // End of the Main function definition.


/*
 * This part of the script handles the execution flow.
 * It reads input from the standard input stream and
 * then invokes the 'Main' function with this input.
 */

// Use Node.js's 'fs' module to read the entire content
// of '/dev/stdin' (standard input) synchronously.
// The input is expected to be encoded in UTF-8.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;