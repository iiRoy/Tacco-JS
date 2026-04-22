/*
 * This function processes the input data.
 * It's designed to take a string as input, representing multiple lines of data.
 */
function     Main   (   input   )
{
    // The input string is split into an array of lines.
    // Each line then corresponds to an element in the 'input' array.
    input   =   input.split   (   "\n"   )   ;

    /*
     * We need to parse the first line as an integer.
     * The parseInt function is used for converting string to decimal integer.
     */
    var     n   =   parseInt   (   input   [   0   ]   ,   10   )   ;

    // The second line contains space-separated strings.
    // It is split into an array of strings.
    var     str   =   input   [   1   ]   .split   (   " "   )   ;


    var     ans   =   ''   ; // Initialize an empty string to store the result.

    // This loop iterates 'n' times to build the 'ans' string.
    for     (   var     i   =   0   ;   i   <   n   ;   i   ++   )
    {
        // Append the character at index 'i' from the first string in 'str'.
        ans   +=   str   [   0   ]   .charAt   (   i   )   ;

        // Append the character at index 'i' from the second string in 'str'.
        // Note: This assumes str[1] exists and has at least 'n' characters.
        ans   +=   str   [   1   ]   .charAt   (   i   )   ;
    }

    // Finally, print the concatenated string to the console.
    console.log   (   ans   )   ;
}

// --- DO NOT MODIFY THE FOLLOWING LINES ---
// This part handles reading from standard input and calling the Main function.
// It ensures compatibility with typical competitive programming environments.
Main   (   require   (   "fs"   )   .readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;