/*
 * This script processes a single line of input containing two space-separated numbers.
 * It then performs a conditional arithmetic operation based on these numbers.
 */

// Define the primary function that encapsulates the core logic of the application.
function   main  (  input  )
{
    // Extract the first number from the first line of input.
    // The '-0' unary plus operator converts the string segment to a number.
    var   a   =   input  [  0  ]  .  split  (  " "  )  [  0  ]  -  0  ;

    // Extract the second number from the same input line.
    // This also uses '-0' for explicit type conversion to an integer.
    var   b   =   input  [  0  ]  .  split  (  " "  )  [  1  ]  -  0  ;

    // Check if 'b' is perfectly divisible by 'a' using the modulo operator.
    if  (  b  %  a   ==   0  )
    {
        // If 'b' is a multiple of 'a', calculate and print their sum.
        console  .  log  (  a  +  b  )  ;
    }
    else
    {
        // Otherwise, if not perfectly divisible, calculate and print their difference.
        console  .  log  (  b  -  a  )  ;
    }
}


// Execute the main function after asynchronously reading and processing input.
// This reads from standard input, decodes as UTF-8, removes leading/trailing whitespace,
// and splits the content into an array of lines.
main  (
    require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  .  trim  (  )  .  split  (  "\n"  )
)  ;

// End of script processing.