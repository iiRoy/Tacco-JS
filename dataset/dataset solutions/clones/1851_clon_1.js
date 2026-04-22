/*
 * This JavaScript file contains the solution for a specific problem.
 * It processes input from standard input, performs a string manipulation,
 * and outputs the result.
 *
 * This code was generated as a Type I clone, focusing on extensive
 * variations in whitespace and comments while maintaining exact
 * structural and logical equivalence to the original source.
 */

// The main function orchestrates the primary logic of the program.
// It takes an array of strings, 'lines', as its input.
function     main   (   lines   )   {

    // Extract the first line, convert it to a number, and store it in 'K'.
    // The unary plus operator is used for type conversion.
    const    K    =    +  lines  [  0  ]  ;


    // The second line of input is treated as the string 'S'.
    const    S    =    lines  [  1  ]  ;


    // Declare a variable 'res' to hold the final result string.
    // This is a ternary operation to conditionally truncate 'S'.
    let    res    =    K    <    S  .  length
        ?    S  .  slice  (  0  ,    K  )    +    '...'
        :    S
        ;

    // Print the computed result 'res' to the console.
    console  .  log  (  res  )  ;

} // End of the 'main' function definition.


// This section handles reading input and initiating the 'main' function.
// It uses Node.js 'fs' module to read from standard input.
main  (
    require  (  "fs"  )
        .  readFileSync  (  "/dev/stdin"  ,    "utf8"  )
        .  trim  (  )
        .  split  (  "\n"  )
)  ;


// A helper utility function to split a string and convert parts to numbers.
// This function is defined but not used in the current 'main' logic.
function     splitN   (   s   )   {

    // Split the input string 's' by spaces, then map each resulting
    // substring to its numerical representation using the Number constructor.
    return    s  .  split  (  ' '  )  .  map  (  Number  )  ;

} // End of the 'splitN' utility function.

// EOF