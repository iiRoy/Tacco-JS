/*
 * This is a JavaScript function designed to process an input string.
 * It checks if the input string contains only unique lowercase English letters,
 * and if each letter appears exactly once in alphabetical order.
 * If all conditions are met, it outputs "yes"; otherwise, it outputs "no".
 */
function         Main   (   input   )
{
    // Trim any leading or trailing whitespace from the input string.
    input    =     input     .     trim     ( )     ;

    /*
     * Initialize a list containing all lowercase English alphabet characters.
     * This list will be modified based on the input.
     */
    var     list     =     "abcdefghijklmnopqrstuvwxyz"     .     split     (     ""     )     ;

    // Loop through each character of the input string.
    for     (     var     i     =     0     ;     i     <     input     .     length     ;     i     ++     )
    {
        // Extract the current character from the input string.
        var     tmp     =     input     .     slice     (     i     ,     i     +     1     )     ;

        // Check if the current character exists in our alphabet list.
        if     (     list     .     indexOf     (     tmp     )     !=     -     1     )
        {
            // If it exists, remove it from the list to mark it as used.
            list     .     splice     (     list     .     indexOf     (     tmp     )     ,     1     )     ;
        }
        else
        {
            // If the character is not in the list (either not an alphabet or already used),
            // then the condition is not met. Output "no" and terminate.
            console     .     log     (     "no"     )     ;
            return     ;
        }
    }

    // If the loop completes without returning, it means all characters were valid and unique.
    // Output "yes".
    console     .     log     (     "yes"     )     ;
}

/*
 * This section handles reading input from standard input and
 * passing it to the Main function for processing.
 * It uses Node.js's 'fs' module to read the file synchronously.
 */
Main     (     require     (     "fs"     )     .     readFileSync     (     "/dev/stdin"     ,     "utf8"     )     )     ;