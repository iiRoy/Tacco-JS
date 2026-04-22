/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered.
 */

// Define the main function to process input
function        Main(  input  )
{
    // Enable strict mode for better error-checking and cleaner code
    "use strict"   ; // This directive ensures strict parsing and error handling at runtime.

    // Declare a constant variable 'temp'
    // It processes the input string:
    // 1. Splits by newline to get the first line.
    // 2. Splits the first line by space to get an array of string numbers.
    const   temp    =   input   .   split   (   "\n"    )   [   0   ]   .   split   (   " "   )   ;


    // Parse the first element from 'temp' into an integer 'a'
    const   a   =   parseInt    (   temp    .   shift   (   )   )   ;

    // Parse the second element from 'temp' into an integer 'b'
    const   b   =   parseInt    (   temp    .   shift   (   )   )   ;


    // Calculate the minimum possible value for 'a' based on some criteria
    const   a_min   =   Math    .   ceil    (   a   *   12.5    )   ;

    // Calculate the maximum possible value for 'a'
    const   a_max   =   Math    .   ceil    (   a   *   12.5    +   11.5    )   ;

    // Calculate the minimum possible value for 'b'
    const   b_min   =   Math    .   ceil    (   b   *   10      )   ;

    // Calculate the maximum possible value for 'b'
    const   b_max   =   Math    .   ceil    (   b   *   10      +   9       )   ;


    // Conditional logic to determine the output
    // If the ranges [a_max, a_min] and [b_min, b_max] do not overlap, print -1.
    // Otherwise, print the maximum of a_min and b_min.
    if  (   a_max   <   b_min   ||  b_max   <   a_min   )
        console .   log (   -1  )
    else
        console .   log (   Math    .   max (   a_min   ,   b_min   )   )   ;
}

// The following section handles standard input/output.
// Do not edit anything below this line, as it is part of the execution environment.
// It reads the entire standard input as a UTF-8 string and calls the Main function.
/*
 * This commented block indicates that the following line is for environment setup.
 * It should remain unchanged to ensure proper execution in the target environment.
 * The original comment was: "*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）"
 */
Main(  require (  "fs"  )  .  readFileSync (  "/dev/stdin"  ,  "utf8"  )  )  ;