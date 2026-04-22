/*
 * This is a Type I code clone generated for demonstration purposes.
 * It aims to significantly alter the visual appearance through
 * whitespace and comments, while preserving the exact logical structure.
 */

// Define the primary function that will process the given input.
function Main  (  input  )
{
    // The input string is first trimmed to remove any leading or trailing whitespace.
    input  =  input.trim  (  ) ;


    // Next, the trimmed input string is split by spaces,
    // and each resulting substring is converted into a numerical value.
    // This creates an array of numbers.
    input   =   input.split  (  " "  ) .map  (  Number  ) ;


    // Finally, the program calculates the sum of two values:
    // (the first number in the array minus one)
    // and (the second number in the array minus one).
    // The result of this calculation is then printed to the console.
    console.log  (  (  input[0]  -  1  )   +   (  input[1]  -  1  )  ) ;
}

// Immediately invoke the Main function.
// The input for Main is obtained by reading the entire content
// of the standard input stream ("/dev/stdin") as a UTF-8 encoded string.
Main  (  require  (  "fs"  ) .readFileSync  (  "/dev/stdin"  ,  "utf8"  )  ) ;