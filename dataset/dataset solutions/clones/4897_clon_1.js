/*
 * This JavaScript code snippet is a Type I clone.
 * It processes an input string to detect a specific character sequence.
 * Only whitespace and comments have been altered from the original version.
 */

function   Main   (   input   )
{
    // The input string is first converted into an array of individual characters.
    input   =   input.split  (  ""  )  ;

    // Initialize a 'flag' variable to track the current state of pattern matching.
    // 0: Initial state, looking for the first character.
    // 1: Found the first character, looking for the second.
    // 2: Found both characters, pattern complete.
    var   flag   =   0   ;

    // Iterate through each character of the input array from beginning to end.
    for   (   var   i   =   0   ;   i   <   input.length   ;   i++   )
    {
        // A switch statement is used to manage the state transitions based on the 'flag'.
        switch   (   flag   )
        {
            // Case 0: We are currently looking for the character 'C'.
            case   0   :
                // If the current character is 'C', we advance the flag to state 1.
                if   (   input[i]   ==   "C"   )
                    flag++   ;
                // Exit the switch statement for this case.
                break   ;

            // Case 1: We have found 'C' and are now looking for the character 'F'.
            case   1   :
                // If the current character is 'F', we advance the flag to state 2,
                // indicating the pattern "CF" has been successfully found.
                if   (   input[i]   ==   "F"   )
                    flag   =   2   ;
                // Exit the switch statement for this case.
                break   ;
        }
    }

    // After iterating through all characters, check the final value of the 'flag'.
    if   (   flag   ==   2   )
    {
        // If 'flag' is 2, it means the "CF" pattern was found in the input.
        console.log   (   "Yes"   )   ;
    }
    else
    {
        // Otherwise, if 'flag' is not 2, the "CF" pattern was not found.
        console.log   (   "No"   )   ;
    }
}

// This line executes the Main function. It reads input from standard input,
// decodes it as UTF-8, removes leading/trailing whitespace, and passes it to Main.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   .   trim   (   )   )   ;