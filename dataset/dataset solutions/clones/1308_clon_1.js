/*
 * This script processes a byte buffer, likely from standard input,
 * to perform a character case swap operation.
 * It's a Type I clone, preserving all original logic and identifiers.
 */


// --- File System Module Import and Input Reading ---

// Load the 'fs' (file system) module to read data.
// The input is read synchronously from '/dev/stdin',
// which typically represents standard input in Unix-like systems.
// The result is stored in the variable 'b', which will be a Buffer object.
b    =    require (  'fs'  ) .  readFileSync (   '/dev/stdin'   ) ;


// --- Character Code Definitions ---

// Define ASCII character codes for uppercase and lowercase letters.
// These are used for comparison and calculation during the case swap.
charA = 65  ,  /* ASCII for 'A' */
charZ = 90  ,  /* ASCII for 'Z' */
chara = 97  ,  /* ASCII for 'a' */
charz = 122 ; /* ASCII for 'z' */


// --- Main Processing Loop ---

// Iterate through each byte in the buffer 'b'.
// 'i' serves as the index for the current byte.
for
(
    i   =   0
    ;
    i   <   b . length
    ;
    i ++
)
{
    // Read the current byte as an unsigned 8-bit integer (0-255).
    // Store it in the variable 'c'.
    c    =    b . readUInt8 (  i  ) ;

    // Check if the character is an uppercase letter.

    // If 'c' is less than 'A', it's not an uppercase letter (e.g., punctuation, numbers).
    // Do nothing for these characters.
    if  (  c  <  charA  )
    {
        /* This block handles non-alphabetic characters before 'A'.
         * No operation is performed, effectively 'void'.
         */
        ;
    }
    // If 'c' is an uppercase letter (between 'A' and 'Z' inclusive).
    else
    if  (  c  <=  charZ  )
    {
        // Convert the uppercase letter to its corresponding lowercase letter.
        // The difference (chara - charA) is the offset between 'a' and 'A'.
        // e.g., 'A' (65) + ('a' (97) - 'A' (65)) = 65 + 32 = 97 ('a').
        b . writeUInt8 (  c  +  (  chara  -  charA  )  ,  i  ) ;
    }
    // If 'c' is greater than 'Z' but less than 'a', it's not a lowercase letter (e.g., '[', '\', ']', '^', '_', '`').
    // Do nothing for these characters.
    else
    if  (  c  <  chara  )
    {
        /* This block handles characters between 'Z' and 'a'.
         * These are not letters, so they are left unchanged.
         */
        ;
    }
    // If 'c' is a lowercase letter (between 'a' and 'z' inclusive).
    else
    if  (  c  <=  charz  )
    {
        // Convert the lowercase letter to its corresponding uppercase letter.
        // The difference (chara - charA) is subtracted to achieve this.
        // e.g., 'a' (97) - ('a' (97) - 'A' (65)) = 97 - 32 = 65 ('A').
        b . writeUInt8 (  c  -  (  chara  -  charA  )  ,  i  ) ;
    }
    // For any other characters (e.g., those greater than 'z').
    else
    {
        /* This final 'else' block catches any characters after 'z'.
         * They are also considered non-alphabetic for this operation.
         */
        ;
    }
}


// --- Output Result ---

// Convert the modified buffer 'b' to a string.
// Then, remove any leading or trailing whitespace (like newlines from input).
// Finally, print the resulting string to the console (standard output).
console . log (  b . toString (  ) . trim (  )  ) ;