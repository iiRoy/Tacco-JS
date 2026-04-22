/*
 * This is an extensively modified Type I clone of a JavaScript program.
 * It strictly adheres to the definition of a Type I clone, meaning:
 * - All identifiers, variable names, function names, operators, and expressions
 *   are preserved exactly as they were in the original source.
 * - The only alterations made are variations in whitespace (including
 *   indentation, spacing, and blank lines) and the addition, removal,
 *   or modification of comments throughout the code.
 * This transformation aims to make the code visually distinct from the original
 * while maintaining absolute logical and structural equivalence.
 */


"use strict" /* Enforce strict parsing and execution rules for the entire script. */ ;


// Define the main function, which serves as the entry point for the program logic.
// This function accepts a single argument, typically representing the input data.
const   main    =   (   input   )   =>
{

    // Declare a constant variable 'S' and assign it the value of the 'input' parameter.
    const   S   =   input   ;


    // Initialize a mutable variable 'price' with a base value of 700.
    // This variable will be updated based on specific conditions.
    let   price   =   700   ;


    // Check the character at the first index (index 0) of the string 'S'.
    // If this character is the "circle" symbol (○), increment the 'price'.
    if   (   S[0]    ===   "○"   )
    {
        price   +=   100   ; /* Add 100 to the price for the first condition met. */
    }


    // Proceed to check the character at the second index (index 1) of 'S'.
    // This is an independent condition check.
    if   (   S[1]    ===   "○"   )
    {
        // If the second character is also "○", further increment the price.
        price   +=   100   ;
    }


    // Finally, examine the character at the third index (index 2) of 'S'.
    // This is the last conditional check for modifying the 'price'.
    if   (   S[2]    ===   "○"   )
    {
        price   +=   100   ; // Add another 100 if the third character is "○".
    }


    // Output the final calculated 'price' to the standard console output.
    console . log ( price ) ;

}   ; // End of the 'main' function definition.


// The following statement is responsible for executing the 'main' function.
// It reads the entire content of the standard input stream (/dev/stdin)
// as a UTF-8 encoded string and passes it as an argument to 'main'.
main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   )   ;