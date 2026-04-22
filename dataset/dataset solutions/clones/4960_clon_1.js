'use strict' ; // Enable strict mode for better error handling and cleaner code.


/**
 *   This  function processes an input string based on a given point value.
 *   It attempts to convert characters in the string to 'a' by "spending" points.
 *   If a character is already 'a', it moves to the next.
 *   Otherwise, it calculates the cost to convert it to 'a' (27 - (char_code - 97 + 1)).
 *   If enough points are available, it converts the character and deducts points.
 *   If not enough points, and it's the last character, it rotates the character
 *   by the remaining points modulo 26.
 *   @param {string} inputString - The raw input string containing the target string and the point value.
 */
function     Main ( inputString )
{

    // Split the input string by newline to separate the target string and the point value.
    let     input     =     inputString . split ( "\n" ) ;


    // The first line of input is the string to be processed.
    let     string    =    input [ 0 ] ;


    // The second line of input is the point value, parsed as an integer.
    let     point     =    parseInt ( input [ 1 ] ) ;


    // 'which' serves as an index to iterate through the characters of the 'string'.
    let     which     =    0 ;


    // Continue processing as long as there are points remaining to be spent.
    while ( point )
    {

        // Check if the current character is already 'a'.
        if ( string [ which ] == "a" )
        {
            // If it's 'a', no points are needed, just move to the next character.
            ++ which ;
        }
        else
        {
            // If the current character is not 'a', calculate the cost to change it to 'a'.
            // The cost is 27 minus (its position in the alphabet + 1).
            // Example: 'b' (98) -> 98-97+1 = 2. Cost = 27-2 = 25.
            if ( ( 27 - ( string [ which ] . charCodeAt ( 0 ) - 97 + 1 ) ) <= point )
            {
                // If enough points are available to change the character to 'a':
                // Deduct the cost from the total points.
                point = point - ( 27 - ( string [ which ] . charCodeAt ( 0 ) - 97 + 1 ) ) ;

                // Replace the current character with 'a'.
                string = string . slice ( 0 , which ) + "a" + string . slice ( which + 1 ) ;

                // Move to the next character.
                ++ which ;
            }
            else
            {
                // If not enough points to change the current character to 'a'.

                // Check if this is the last character in the string.
                if ( string . length === ( which + 1 ) )
                {
                    // If it's the last character and we can't fully convert it to 'a':
                    // Use the remaining points to rotate the character within the alphabet.
                    // The rotation is modulo 26 because there are 26 letters.
                    point = point % 26 ;

                    // Calculate the new character code by adding the remaining points.
                    var     code    =    ( string [ which ] . charCodeAt ( 0 ) + point ) ;

                    // If the new character code exceeds 'z' (122), wrap it around to 'a'.
                    if ( code > 122 )
                    {
                        // Example: if 'z' (122) + 1 point, it should become 'a' (97).
                        // 122 + 1 = 123.
                        // 123 + (-122 + 97 - 1) = 123 - 26 = 97.
                        code += ( - 122 + 97 - 1 ) ;
                    }

                    // Convert the new character code back to a character.
                    var     lastLetter    =    String . fromCharCode ( code ) ;

                    // All points have been spent on this last character.
                    point = 0 ;

                    // Update the string with the new last character.
                    string = string . slice ( 0 , which ) + lastLetter + string . slice ( which + 1 ) ;
                }
                else
                {
                    // If not enough points, and it's NOT the last character,
                    // we cannot change it. So, just move to the next character.
                    // This implies that the current character cannot be made 'a'
                    // and we move on hoping to spend points on subsequent characters.
                    ++ which ;
                }
            }
        }
    }

    // Output the final modified string to the console.
    console . log ( string ) ;
}


// Read input from standard input (usually a file or console) using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
// Then, call the Main function with the read content.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;