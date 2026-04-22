/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition, preserving all identifiers and logic.
 * Only whitespace and comments have been altered significantly.
 */
"use strict"
; // Enforce strict mode for better code quality.


function   Main (  input   )
{
    // Split the input string into an array of lines.
    let   lines   =   input.split (  "\n"  )  ;


    // Process the first line: split by whitespace, convert to numbers.
    let   Ln   =   lines.shift (  )  .split (  /\s/  )  .map (  (v)   =>   v   -   0  )  ;


    // Destructure the processed numbers into variables A and B.
    let   A   =   Ln[0]  ,
          B   =   Ln[1]  ;


    let   ans   =   0  ; // Initialize the answer variable.

    // Determine the answer based on conditions of A and B.
    if   (  A   ==   B  )
    {
        ans   =   A  ; // If A and B are equal, the answer is A.
    }
    else   if   (  (A   +   B)   %   2   ==   0  )
    {
        // If the sum of A and B is even, apply bitwise XOR and subtract 1.
        ans   =   (A   ^   B)   -   1  ;
    }
    else
    {
        // Otherwise (if the sum is odd), apply only bitwise XOR.
        ans   =   A   ^   B  ;
    }


    console.log (  ans  )  ; // Output the calculated answer to the console.
}

// Call the Main function with the content of /dev/stdin.
Main (
    require (  "fs"  )
        .readFileSync (  "/dev/stdin"  ,   "utf8"  )
);
// End of file.