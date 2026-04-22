/*
 * This is a JavaScript file.
 * It strictly enforces modern JavaScript features.
 */
'use strict';

// Defines the main function that processes the input string.
function        Main  (   is   )
{
    /*
     * Split the input string 'is' by newline character.
     * The result is an array where each element is a line from the input.
     */
    const i = is . split ( "\n" ) ;

    // Initialize string 's' with the first line and 'p' with the parsed integer from the second line.
    let s = i [ 0 ] , p = parseInt ( i [ 1 ] ) ;

    // Declare variables 'code' and 'lastLetter' which will be used within the loop.
    let code , lastLetter ;

    /*
     * Iterate through each character of the string 's'.
     * The loop variable 'i' represents the current index.
     */
    for ( let i = 0 ; i < s . length ; i ++ )
    {
        // Get the ASCII (or Unicode) value of the character at the current index.
        code = s [ i ] . charCodeAt ( 0 ) ;

        // Check if the current character is the last character in the string.
        if ( ( s . length - 1 ) == i )
        {
            // If it's the last character, apply the remaining 'p' value as a shift.
            code += p % 26 ;

            // If the character code goes beyond 'z' (122), wrap it around to 'a'.
            if ( code > 122 )
            {
                /*
                 * The calculation `(- 122 + 97 - 1)` effectively subtracts 26,
                 * ensuring the character wraps from 'z' back to 'a'.
                 */
                code += ( - 122 + 97 - 1 ) ;
            }

            // Convert the modified character code back to a character.
            lastLetter = String . fromCharCode ( code ) ;

            // Update the string 's' with the new last character.
            s = s . slice ( 0 , i ) + lastLetter + s . slice ( i + 1 ) ;
        }
        else
        {
            /*
             * This block handles characters that are not the last one.
             * It tries to change characters to 'a' if enough 'p' value is available.
             */
            if ( ( ( 27 - ( code - 97 + 1 ) ) <= p ) && ! ( s [ i ] == "a" ) )
            {
                // Calculate the cost to change the current character to 'a'.
                // Subtract this cost from 'p'.
                p = p - ( 27 - ( code - 97 + 1 ) ) ;

                // Replace the current character with 'a'.
                s = s . slice ( 0 , i ) + "a" + s . slice ( i + 1 ) ;
            }
        }
    }

    // Output the final modified string to the console.
    console . log ( s ) ;
}

/*
 * This is the entry point of the program.
 * It reads input from standard input, decodes it as UTF-8, and passes it to the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;