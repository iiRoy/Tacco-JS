// This file contains a JavaScript program to process three integer inputs.
// It identifies the maximum of the three numbers and performs a specific calculation.

function   Main(  input  )
{

    // The 'input' parameter receives the entire input data as a string.
    // First, split the input string by newline characters to get individual lines.
    input   =   input.split( "\n" )   ;

    // The first line of input contains three space-separated numbers.
    // Split this first line by spaces to get an array of string representations.
    tmp   =   input[0].split( " " )   ;

    // Convert the string parts to integer numbers using parseInt.
    // The second argument '10' ensures base-10 conversion.
    var   a   =   parseInt(   tmp[0]  ,  10   )   ;
    var   b   =   parseInt(   tmp[1]  ,  10   )   ;
    var   c   =   parseInt(   tmp[2]  ,  10   )   ;


    // Determine the maximum value among the three parsed integers.
    var   max   =   Math.max(   a,  b,  c   )   ;


    // Check if 'a' is the maximum value.
    if   (  a   ==   max  )
    {
        // If 'a' is max, multiply it by 10 and add the other two numbers.
        // Then, print the result to the console.
        console.log(   '%d'  ,  (  (  a   *   10  )   +   b   +   c  )   )   ;
        return   ;   // Exit the function after processing.
    }


    // Check if 'b' is the maximum value.
    if   (  b   ==   max  )
    {
        // If 'b' is max, multiply it by 10 and add the other two numbers.
        // Then, print the result to the console.
        console.log(   '%d'  ,  (  (  b   *   10  )   +   a   +   c  )   )   ;
        return   ;   // Exit the function after processing.
    }


    // If neither 'a' nor 'b' was the maximum, then 'c' must be the maximum.
    if   (  c   ==   max  )
    {
        // If 'c' is max, multiply it by 10 and add the other two numbers.
        // Then, print the result to the console.
        console.log(   '%d'  ,  (  (  c   *   10  )   +   a   +   b  )   )   ;
        return   ;   // Exit the function after processing.
    }

}

// The following line should not be modified. It handles standard input/output
// by reading the entire file content and passing it to the Main function.
Main(   require(  "fs"  ) .  readFileSync(  "/dev/stdin"  ,  "utf8"  )   )   ;