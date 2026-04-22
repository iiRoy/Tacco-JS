/*
 * This JavaScript code snippet reads data from standard input,
 * processes each character to invert its case (lowercase to uppercase,
 * and vice-versa), and then prints the modified string to standard output.
 * Non-alphabetic characters remain unchanged.
 */


// Attach an event listener to the 'data' event of standard input.
// This function will be executed whenever data is available from stdin.
process.stdin.on (
    "data" ,

    // The callback function receives the input data chunk 'c'.
    function ( c )
    {
        // Convert the input chunk 'c' to a string,
        // remove any leading or trailing whitespace,
        // and then split it into an array of individual characters.
        console.log ( ( c + "" ) . trim () . split ( "" ) . map (

            // The map function iterates over each character 's' at index 'n'.
            function ( s , n )
            {
                // Retrieve the Unicode (or ASCII) value of the current character 's'.
                n = s . charCodeAt ();

                // Apply a ternary operation to determine the new character code:
                // 1. If 'n' is between 97 (for 'a') and 122 (for 'z'),
                //    it's a lowercase letter. Convert to uppercase by subtracting 32.
                // 2. Else, if 'n' is between 65 (for 'A') and 90 (for 'Z'),
                //    it's an uppercase letter. Convert to lowercase by adding 32.
                // 3. Otherwise (it's not an alphabetic character), keep 'n' as is.
                return String . fromCharCode (
                    97 <= n && n <= 122
                        ? n - 32
                        : 65 <= n && n <= 90
                            ? n + 32
                            : n
                ) ; // End of String.fromCharCode() call
            }
        ) . join ( "" ) ); // Join the array of processed characters back into a single string.
    }
) . resume (); // Ensure that standard input is in flowing mode to continuously emit 'data' events.