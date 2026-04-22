/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive modifications to whitespace and comments
 * while keeping all identifiers, expressions, and logic identical.
 */

// Define the main function that processes the input string.
function   main   (   input   )   {
    // Split the input string by spaces to get individual arguments.
    const   args   =   input.split(   " "   )   ;

    // Declare variables A, op (operator), and B from the parsed arguments.
    const   A   =   args[0]   ,
          op   =   args[1]   ,   // The operator string.
          B   =   args[2]   ;

    // Check the operator to perform the corresponding arithmetic operation.
    if   (   op   ===   "+"   )
    {
        // If the operator is '+', perform addition.
        console.log(   A   +   B   )   ;
    }
    else
    {
        // Otherwise (assuming it's '-'), perform subtraction.
        console.log(   A   -   B   )   ;
    }
}

// Read the input from standard input and pass it to the main function.
// This uses Node.js's 'fs' module to synchronously read the file.
main   (   require(   'fs'   )   .   readFileSync(   '/dev/stdin'   ,   'utf8'   )   )   ;