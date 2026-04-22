/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are kept exactly the same.
 * Only whitespace and comments have been modified extensively to make it
 * visually different, yet functionally identical.
 */

// Define the main function that processes the input received
function    Main (  input )
{
    // Split the entire input string into individual lines based on the newline character.
    var     lines   =   input   .   split (   '\n'   )   ;

    // Initialize an empty array. This will be used as a frequency map
    // to store the counts of each character (case-insensitive).
    var     count   =   [   ]   ;


    // Begin iterating through each line in the 'lines' array.
    // The 'for...in' loop iterates over the keys (indices) of the array.
    for (  var   x   in   lines  )
    {
        // Check if the current line is an empty string.
        // An empty line typically signals the end of meaningful input data.
        if (  lines[  x  ]   ==   ""  )
            break   ; // If empty, exit the loop for processing lines.


        // Inner loop: Iterate over each character within the current line.
        // The loop variable 'i' represents the index of the character in the line.
        for (  var   i   =   0  ;   i   <   lines[  x  ].length  ;   ++i  )
        {
            // Convert the current character to lowercase to ensure case-insensitive counting.
            const   current_char_lower  =   lines[  x  ][  i  ].toLowerCase (   )   ;

            // Check if this lowercase character has been encountered and counted before.
            if (  !count[  current_char_lower  ]  )
            {
                // If the character is encountered for the first time, initialize its count to 1.
                count[  current_char_lower  ]   =   1   ;
            }
            else
            {
                // If the character has been encountered before, increment its existing count.
                ++count[  current_char_lower  ]   ;
            }
        } // End of inner loop (character iteration)
    } // End of outer loop (line iteration)


    // After processing all input lines, iterate through the lowercase English alphabet
    // to print the frequency of each letter.
    // 0x61 is the hexadecimal ASCII value for 'a', and 0x7a is for 'z'.
    for (  var   i   =   0x61  ;   i   <=   0x7a  ;   ++i  )
    {
        // Convert the current ASCII integer value back to its character representation.
        var     c   =   String   .   fromCharCode (  i  )   ;

        // Print the character and its frequency.
        // If a character was not present in the input, its count in the 'count' array
        // would be undefined. The ternary operator handles this by printing 0 instead.
        console   .   log (  c   +   " : "   +   (   (   count[  c  ]  )   ?   count[  c  ]  :   0   )  )   ;
    }

} // End of the Main function definition


// This is the entry point of the script.
// It reads the input from standard input (/dev/stdin) using Node.js 'fs' module
// and then passes it to the 'Main' function.
Main (  require (  "fs"  )   .   readFileSync (  "/dev/stdin"  ,   "utf8"  )  )   ;