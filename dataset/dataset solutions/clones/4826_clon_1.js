/*
 * This is the main entry point function for processing input.
 * It takes a string 'input' and performs a series of replacements
 * to determine if the string consists solely of specific keywords.
 */
function     Main(    input    )
{
    // Declare a variable to store the result after replacements.
    // The goal is to remove predefined "magic" words from the input string.
    var  erased   =   input
        .replace(   /eraser/g  ,   ''   )   // Remove all occurrences of 'eraser'
        .replace(   /erase/g   ,   ''   )   // Then, remove all occurrences of 'erase'
        .replace(   /dreamer/g ,   ''   )   // Next, remove all occurrences of 'dreamer'
        .replace(   /dream/g   ,   ''   )   ;  // Finally, remove all occurrences of 'dream'

    // After all replacements, check if the string is empty.
    if    (   erased   ===   ''   )
    {
        // If the string is empty, it means the original input
        // was entirely composed of the magic words.
        console.log("YES");
    }
    else
    {
        // If the string is not empty, it means there were
        // other characters or sequences not covered by the magic words.
        console.log("NO");
    }

}


// Execute the Main function with input read from standard input.
// This reads the entire content of /dev/stdin as a UTF-8 string.
Main(   require("fs")  .  readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;