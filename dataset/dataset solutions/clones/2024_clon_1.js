/*
 * This is a Type I clone of the original JavaScript code.
 * It processes a numeric input to calculate a specific sum.
 *
 * Type I clone definition:
 * - Code fragments are exactly equal, except for possible variations
 *   in whitespace and comments.
 * - All identifiers, operators, and expressions are preserved.
 */
function   Main  (  input  )
{
    // The input string is split into an array of strings by newline characters.
    input   =   input.split (  "\n"  )   ;

    // The first element of the input array is parsed as an integer.
    let   num   =   parseInt (  input [  0  ]  )   ;

    // Calculate the number of times 500 fits into 'num'.
    // This result can be a floating-point number.
    let   fhun   =   num   /   500   ;

    // Calculate the remainder when 'num' is divided by 500,
    // then divide that remainder by 5.
    // This result can also be a floating-point number.
    let   five   =   (  num   %   500  )   /   5   ;

    // Output the sum of the floor values of 'fhun' and 'five'.
    // Math.floor() rounds a number down to the nearest integer.
    console.log (  Math.floor (  fhun  )   +   Math.floor (  five  )  )   ;
}

// The Main function is called with input read from standard input.
// The 'fs' module is used to read the file, and 'utf8' specifies the encoding.
Main (  require (  "fs"  )  .readFileSync (  "/dev/stdin"  ,   "utf8"  )  )   ;