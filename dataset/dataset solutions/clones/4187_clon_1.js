/*
 * This JavaScript file contains a main function designed to process numerical input.
 * It demonstrates basic string manipulation, array operations, and mathematical functions.
 *
 * This version is a Type I clone, preserving all original identifiers, operators,
 * and expressions, while extensively varying whitespace and adding comments.
 */


// Define the primary function that orchestrates the input processing.
function   main  (  input  )
{

    // Step 1: Normalize the input string by removing any leading or trailing whitespace.
    input  =  input . trim ( ) ;

    /*
     * Step 2: Process the cleaned input string.
     * First, split the string into an array of substrings using a space as the delimiter.
     * Then, use the `map` method with the `Number` constructor to convert each substring
     * into its corresponding numerical value. The resulting array of numbers is
     * assigned to the constant variable `a`.
     */
    const   a   =   input . split ( " " ) . map ( Number ) ;


    // Step 3: Perform a calculation and output the result.
    // Calculate the product of the first two elements of array `a` (a[0] multiplied by a[1]).
    // Then, find the minimum value between this product and the third element of array `a` (a[2]).
    // Finally, print this minimum value to the standard output using `console.log`.
    // Note: The original input had a missing closing parenthesis here, which has been corrected
    // to ensure the generated code is syntactically valid JavaScript.
    console . log ( Math . min ( a [ 0 ] * a [ 1 ] ,   a [ 2 ] ) ) ;

}


// This section handles the execution of the main function.
// It reads the entire content of `/dev/stdin` (standard input in Unix-like systems)
// as a UTF-8 encoded string using Node.js's built-in `fs` module,
// and then passes this string as an argument to the `main` function.
main (  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )  ) ;