/*
 * This is a JavaScript program designed to process a given input string.
 * It counts occurrences of a specific character and performs a calculation.
 *
 * This file represents a Type I clone of an original source.
 * All functional elements, identifiers, and expressions are preserved.
 * Only whitespace and comments have been altered or added.
 */

// Define the main function that encapsulates the core logic.
function   main (   input   )   {

    // Declare a constant variable 'a'.
    // It stores the input string after trimming whitespace and splitting into an array of characters.
    const   a   =   input .   trim () .   split ( '' )   ;


    // Initialize a mutable variable 'ans' with a starting base value.
    let   ans   =   700   ;

    // Iterate over each character in the array 'a'.
    // The forEach method executes a provided function once for each array element.
    a .   forEach (   function   (   a   )   {
        // This 'a' here is the current character from the array during iteration.
        // Check if the current character is strictly equal to the character 'o'.
        if   (   a   ==   'o'   )   {
            // If the condition is true, increment the 'ans' variable by 100.
            ans   +=   100   ;
        }
        // End of the conditional block.
    }   )   ;   // End of the forEach loop's callback function and the forEach call itself.


    // Output the final calculated value to the standard console.
    // The final result is 700 plus the accumulated 'ans' value.
    console .   log (   700   +   ans   )   ;

} // End of the main function definition.


// This part of the script handles reading input and initiating the program.
// It reads the entire content of '/dev/stdin' as a UTF-8 string using Node.js's 'fs' module.
// The read content is then passed as an argument to the 'main' function.
main   (   require (   'fs'   ) .   readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;

/*
 * End of the cloned JavaScript program.
 * The structure and logic remain perfectly identical to the original.
 */