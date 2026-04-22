/**
 * This JavaScript file contains the solution for an AtCoder problem,
 * specifically Atcoder150 - B.
 * The primary function `main` processes input to count occurrences
 * of the pattern "ABC" within a given string.
 *
 * It demonstrates basic string manipulation, array operations,
 * and loop-based conditional counting.
 */

function   main (   input   )
{

    // Split the entire input string by newline characters to get an array of lines.
    var   inputs   =   input . split (   '\n'   ) ;

    // Parse the first line of input as an integer, representing 'n'.
    // The radix 10 is specified for safety.
    var   n   =   parseInt (   inputs [ 0 ] ,   10   ) ;

    // The second line of input is the string 's' we need to analyze.
    var   s   =   inputs [ 1 ] ;


    // Append two 'X' characters to the string 's'.
    // This padding helps to avoid out-of-bounds errors when checking
    // sArr[i + 1] and sArr[i + 2] in the loop, simplifying the loop condition.
    s   +=   'X'   +   'X' ;

    // Convert the modified string 's' into an array of characters.
    var   sArr   =   Array . from (   s   ) ;


    // Initialize a counter to keep track of the occurrences of "ABC".
    var   counter   =   0 ;


    // Iterate through the character array.
    // The loop runs up to `sArr.length - 2` because we need to access
    // `i + 1` and `i + 2` without going out of bounds.
    for
    (
        let   i   =   0 ;
        i   <   sArr . length   -   2 ;
        i ++
    )
    {
        // Check if the current character is 'A'.
        if   (   sArr [ i ]   ===   'A'   )
        {
            // If the current character is 'A', then check if the next two characters
            // form 'B' and 'C' respectively.
            // This is a ternary operation: if the condition is true, add 1 to counter;
            // otherwise, add 0 (effectively doing nothing).
            counter   +=   sArr [ i   +   1 ]   ===   'B'   &&   sArr [ i   +   2 ]   ===   'C'   ?   1   :   0 ;
        }
    }
    ; // Semicolon for potential parser quirks, though not strictly necessary here.


    // Output the final count of "ABC" occurrences to the console.
    console . log (   counter   ) ;

}

// This line reads the input from standard input, typically used in competitive programming environments.
// It uses Node.js's 'fs' module to read the file at '/dev/stdin' synchronously and
// decodes it as a UTF-8 string before passing it to the main function.
main (   require (   'fs'   ) . readFileSync (   '/dev/stdin' ,   'utf8'   )   ) ;