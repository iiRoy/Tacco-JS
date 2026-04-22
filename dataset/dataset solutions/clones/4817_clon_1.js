/*
 * This is a Type I clone of a simple JavaScript program.
 * It reads a single character from standard input
 * and determines if it is a vowel or a consonant.
 *
 * This version includes extensive whitespace and comments
 * but maintains the exact original code structure and identifiers.
 */

// Declare a variable 'c' using 'let' keyword.
let    c
    =  require (
        "fs"
    ) . readFileSync  (
        // Specify the file path for standard input.
        "/dev/stdin"  ,
        // Specify the encoding for reading the file.
        "utf8"
    ) ; // End of the file reading statement.


// Log the result to the console.
console . log (
    // Check if the string "aeiou" includes the character 'c'.
    "aeiou"
        . includes (
            c
        )
            ?  // If true (character is a vowel), output "vowel".
            "vowel"
            :  // If false (character is a consonant), output "consonant".
            "consonant"
) ; // End of console.log statement.