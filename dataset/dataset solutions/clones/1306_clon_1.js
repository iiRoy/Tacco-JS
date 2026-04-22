/*
 * This JavaScript code defines a function 'main' that processes a given input string.
 * The primary purpose of this function is to invert the case of alphabetic characters
 * within the input string, leaving non-alphabetic characters unchanged.
 */
function   main   (   input   )
{
    // The input string is assigned to the 'str' variable for processing.
    let   str   =   input   ;

    // A constant string containing all lowercase English alphabet characters.
    let   low   =   "abcdefghijklmnopqrstuvwxyz"   ;

    // A constant string containing all uppercase English alphabet characters.
    let   up   =   "ABCDEFGHIJKLMNOPQRSTUVWXYZ"   ;

    // This variable will accumulate the processed characters to form the final result.
    let   answer   =   ""   ;

    // Begin iterating through each character of the 'str' string.
    for   (   let   i   =   0   ;   i   <   str.length   ;   i++   )
    {
        // 'put' is a temporary variable to hold the case-converted or original character.
        let   put   =   ""   ;

        // Check if the current character is found within the 'low' string (i.e., it's a lowercase letter).
        if   (   low.indexOf(str[i])   !==   -1   )
        {
            // If it's a lowercase letter, convert it to its uppercase equivalent.
            put   =   str[i].toUpperCase()   ;
        }
        // If not lowercase, check if it's found within the 'up' string (i.e., it's an uppercase letter).
        else   if   (   up.indexOf(str[i])   !==   -1   )
        {
            // If it's an uppercase letter, convert it to its lowercase equivalent.
            put   =   str[i].toLowerCase()   ;
        }
        // If the character is neither a lowercase nor an uppercase letter,
        // it means it's a non-alphabetic character (e.g., number, symbol, space).
        else
        {
            // In this case, the character is kept as is without any case modification.
            put   =   str[i]   ;
        }

        // Append the processed character (either case-converted or original) to the 'answer' string.
        answer   +=   put   ;
    }

    // After the loop completes, the 'answer' string holds the full processed result.
    // The '.trim()' method is called to remove any leading or trailing whitespace
    // from the final string before it is printed to the console.
    console.log   (   answer.trim()   )   ;

}

/*
 * This segment of the code is responsible for the execution flow.
 * It reads the input from the standard input stream ('/dev/stdin')
 * using Node.js's 'fs' module and then passes this input to the 'main' function.
 * The input is assumed to be UTF-8 encoded.
 */
main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf-8"   )   )   ;