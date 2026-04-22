/*
 * This JavaScript file defines a function 'RorB' that processes
 * a given input string to determine a specific outcome based on
 * the counts of 'R' and 'B' characters within it.
 *
 * The input is expected to be a multi-line string.
 * The first line typically contains a numerical value (N),
 * and the second line contains a sequence of 'R' and 'B' characters.
 *
 * This code represents a Type I clone of an original source.
 * All syntactic elements, identifiers, operators, and expressions
 * remain absolutely identical to the original.
 * The only modifications introduced are variations in whitespace
 * (including indentation, spacing, and blank lines) and the addition
 * of extensive comments to alter the visual appearance without
 * changing the underlying logic or structure.
 */

// Declaration of the main function, named 'RorB', which accepts a single argument 'input'.
function         RorB(   input   )
{
    // Initialize two local variables, 'R' and 'B', to count occurrences.
    // Both are set to zero at the beginning of the function execution.
    let R   =   0,
        B   =   0
    ;

    // Split the entire input string into an array of strings, using the newline character as a delimiter.
    // This effectively separates each line of the input into an element of the 'inputN' array.
    // The original code included a double semicolon, which is preserved here as an empty statement.
    const inputN    =   input.split(   '\n'   )   ;   ;    // The problem statement indicates 1 <= inputN.length <= 100.

    // Parse the first element of the 'inputN' array (which is the first line of the input)
    // into an integer. Before parsing, any carriage return or newline characters are removed
    // from the string to ensure a clean numerical conversion. This value is assigned to a
    // global variable 'N' (as it's not declared with 'let' or 'const').
    N   =   parseInt(   inputN[0].replace(   /\r?\n/g   ,   ''   )   )   ;

    // Process the second element of the 'inputN' array (the second line of the input).
    // Similar to 'N', newline/carriage return characters are removed.
    // Then, the resulting string is split into an array of individual characters.
    // This character array is assigned to a global variable 'inputS'.
    inputS  =   inputN[1].replace(   /\r?\n/g   ,   ''   )
                         .split(   ''   )   ;

    // Iterate over each character 's' within the 'inputS' array using the forEach method.
    // This loop processes every character one by one to tally 'R' and 'B' counts.
    inputS.forEach(   (   s   )   =>
    {
        // Conditional check: if the current character 's' is strictly equal to the string 'R'.
        if         (   s   ===   'R'   )
        {
            // If the character is 'R', increment the counter for 'R' by one.
            R   ++   ;
        }
        else
        {
            // If the character is not 'R' (implying it's 'B' based on the problem context),
            // increment the counter for 'B' by one.
            B   ++   ;
        }
    }   )   ; // End of the forEach loop's callback function.

    // After iterating through all characters and updating the counts,
    // perform a final comparison between the total count of 'R' and 'B'.
    if         (   R   >   B   )
    {
        // If the count of 'R' characters is strictly greater than the count of 'B' characters,
        // output the string "Yes" to the standard console output.
        console.log(   "Yes"   )   ;
    }
    else
    {
        // Otherwise (meaning R is less than or equal to B),
        // output the string "No" to the standard console output.
        console.log(   "No"   )   ;
    }
} // Concluding brace for the RorB function definition.


// This line of code invokes the 'RorB' function.
// It uses Node.js's built-in 'fs' (file system) module to read content
// from standard input, typically '/dev/stdin' in Unix-like environments.
// The file is read synchronously and its content is encoded as UTF-8,
// then passed as the 'input' argument to the 'RorB' function.
RorB(   require(   "fs"   )
                  .readFileSync(   "/dev/stdin"   ,
                                   "utf8"   )   )   ;