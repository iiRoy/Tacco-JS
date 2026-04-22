// This file is a Type I clone of the original JavaScript code.
// Only whitespace and comments have been altered.
// The functional behavior remains absolutely identical.

'use strict' // This directive enforces strict mode for the entire script, improving code quality.

/**
 * The primary function responsible for processing the input character.
 * It determines whether the given character is a vowel or a consonant.
 *
 * @param {string} input - The raw input string, which is expected to contain a single character.
 * @returns {void} This function does not return a value; it prints directly to the console.
 */
const main = ( input ) =>
{
    // Extract the character and remove any surrounding whitespace.
    const c = input . trim ( ) ;

    // Define the set of lowercase English vowels.
    // Check if the trimmed character 'c' is present within this set.
    if ( [ 'a' , 'e' , 'i' , 'o' , 'u' ] . includes ( c ) )
    {
        // If 'c' is found in the vowel set, print 'vowel'.
        console . log ( 'vowel' ) ;
    }
    else
    {
        // Otherwise, if it's not a vowel, consider it a consonant and print 'consonant'.
        console . log ( 'consonant' ) ;
    }
} // End of the 'main' function.


// This is the entry point for the script's execution.
// It reads data from standard input asynchronously using Node.js's 'fs' module.
// The read data is then passed as an argument to the 'main' function.
main (
    require ( 'fs' )
        . readFileSync (
            '/dev/stdin' , // Specifies the file path for standard input.
            'utf8'         // Specifies the encoding to use when reading the file.
        )
) ; // The semicolon terminates the expression statement.