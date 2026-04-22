'use strict'; // This directive enforces stricter parsing and error handling in the code.

// Define a concise arrow function 'p' to print messages to the console.
const   p = s   =>  console.log ( s ) ;


// The primary function 'main' processes the input provided.
// It expects an array 'input', where each element typically represents a line of data.
function main  (   input   )
{
    // Parse the first line of input (input[0]) to extract three numerical values.
    // The values are space-separated.
    let     A   =   input [ 0 ] . split ( " " ) [ 0 ] ; // The first number from the input line.
    let     B   =   input [ 0 ] . split ( " " ) [ 1 ] ; // The second number from the input line.
    let     N   =   input [ 0 ] . split ( " " ) [ 2 ] ; // The third number from the input line.

    // Initialize a variable 'max' to keep track of the largest calculated value.
    let     max = 0 ;


    // Begin a loop that iterates from i = 1 up to and including N.
    for  (  let i = 1  ;  i <= N  ;  i ++  )
    {
        // Calculate 'num' using a specific mathematical formula involving A, B, and i.
        // This formula is: floor(A*i/B) - A * floor(i/B)
        let num = Math . floor ( A * i / B ) - A * Math . floor ( i / B ) ;

        // Compare the newly calculated 'num' with the current 'max' value.
        if  (  num  >  max  )
        {
            // If 'num' is greater, update 'max' to this new value.
            max = num ;
        }
    }

    // After the loop completes, print the final maximum value found.
    p ( max ) ;
}
/*
 *  DO NOT MODIFY THE CODE BELOW THIS COMMENT BLOCK.
 *  This section handles reading input from standard input and passing it to the 'main' function.
 *  It ensures that the 'main' function receives the input as an array of strings,
 *  where each string is a line from the input.
*/
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . trim ( ) . split ( "\n" ) ) ;