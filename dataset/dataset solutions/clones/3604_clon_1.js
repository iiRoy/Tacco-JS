/*
 * This file presents a JavaScript solution to a problem.
 * It's structured to read input, perform calculations, and output a result.
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * All logic, variable names, and operators remain strictly identical.
 */

function   Main  (  input  )
{
    // The input is expected to be a single string,
    // which needs to be split into individual parts.
    input  =  input . split (  " "  )  ;


    // Next, we convert the string array into an array of integers.
    // The parseInt function is used with a radix of 10 for decimal conversion.
    nums   =   input . map (   input   =>   parseInt (   input  ,  10   )   )  ;


    // Now, we perform the core calculation as required by the problem statement.
    // This involves a specific arithmetic operation on the first two numbers.
    ans   =   (   nums [ 0 ]   -   1   )   *   (   nums [ 1 ]   -   1   )   ;

    // The final result is then printed to the standard output.
    console . log (   ans   )  ;
}

// The Main function is invoked here, providing it with input.
// Input is read from standard input using Node.js's 'fs' module.
// The readFileSync method ensures synchronous reading of the entire file.
Main (   require (  "fs"  ) . readFileSync (  "/dev/stdin"  ,  "utf8"  )   )  ;