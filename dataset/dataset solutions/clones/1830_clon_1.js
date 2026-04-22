/*
 * This JavaScript file processes input from standard input.
 * It reads a line, then performs a specific string replacement operation.
 * The primary goal is to substitute specific two-character patterns
 * (like "?D", "PD", "?P", "PP") with the fixed string "PD"
 * within the first line of the provided input.
 */


    var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . split ( '\n' ) ; // This line reads the entire content of standard input, decodes it using UTF-8, and then splits it into an array of strings based on newline characters.


// Declare a variable named 'T' and assign it the very first element
// from the 'input' array, which represents the first line of the input.
var     T     =     input [ 0 ] ;


/*
 * Here, a regular expression is defined to identify specific patterns.
 * The pattern `[\?|P]` matches either a literal '?' character or an 'P' character.
 * The pattern `[\?|D]` matches either a literal '?' character or a 'D' character.
 * The `g` flag at the end ensures that this regular expression will perform a global search,
 * meaning it will find and match all occurrences of the pattern within the target string.
 */
var     pdReg     =     / [ \? | P ] [ \? | D ] /g ;


    // Finally, the modified string is printed to the console.
    // The `replace` method is used on the string 'T' to find all occurrences
    // matching 'pdReg' and replace them with the static string 'PD'.
    console . log ( T . replace ( pdReg , 'PD' ) ) ;


// End of script execution.