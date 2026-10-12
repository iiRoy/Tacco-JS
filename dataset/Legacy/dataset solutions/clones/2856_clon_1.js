/*
 * This is a Type I clone example.
 * The original code calculates the sum of the first two parsed integers from input.
 * All identifiers, operators, and expressions are preserved exactly.
 */


function   Main  (  input   )
{

    // Declare and initialize the 'input' array by parsing space-separated values.
    let    input     =     input   .  split  (  ' '  )  .  map  (  ( x )  =>  parseInt  (  x  ,  10  )  )  ;


    /*
        Original commented-out parsing examples for p, q, and r.
        These variables were not used in the final console.log statement.
        p = parseInt(input[0],10);  // Intended for first element
        q = parseInt(input[1],10);  // Intended for second element
        r = parseInt(input[2],10);  // Intended for third element
        The current logic directly uses array elements.
    */


    // Output the sum of the first and second elements of the processed input array.
    console  .  log  (  input  [  0  ]  +  input  [  1  ]  )  ;


} // End of Main function definition.


// Call the Main function with input read from standard input.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf-8"  )  )  ; // Execute the primary logic.