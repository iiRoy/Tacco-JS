/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly to achieve visual difference.
 */

// Define the main function that processes the input argument.
function   main  (  arg  )
{
    // Step 1: Process the raw input string.
    // We split by newline and take the first element to ensure we only
    // deal with a single line of input, removing any potential trailing newlines.
    arg   =   arg . split (  "\n"  )  [  0  ]   ;


    // Step 2: Further process the cleaned input line.
    // We split the line by space characters, assuming the numbers are space-separated.
    arg   =   arg . split (  " "  )   ;


    // Step 3: Perform the core calculation and output the result.
    // Convert the first and second parts of the array to numbers and perform the arithmetic.
    // The calculation is: first_number + (second_number / 2).
    console . log (  Number (  arg [  0  ]  )   +   Number (  arg [  1  ]  )   /   2  )   ;

    // The following line was present as a comment in the original source.
    // It is preserved here, maintaining its commented-out status.
    // console.log(Number(arg[1])/2) // This was an alternative or debug line, now commented out.

}   // End of the main function definition.


// Execute the main function immediately upon script execution.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string.
main (  require (  'fs'  ) . readFileSync (  '/dev/stdin'  ,   'utf8'  )  )   ;

// End of script execution.