/* This is a simple JavaScript program.
 * It reads two numbers from standard input,
 * checks a condition, and prints a message.
 */

// Enable strict mode for better error handling and cleaner code.
'use strict'



// Define the main function that processes the input.
const   main    =   input   =>  {
    // Split the input string by newlines, then each line by spaces.
    const   args    =   input . split ( '\n' ) . map (   arg   =>   arg . split ( ' ' )   )

    // Parse the first number from the first line of arguments.
    const   a   =   parseInt (   args [ 0 ] [ 0 ]   ,   10   )

    // Parse the second number from the first line of arguments.
    const   b   =   parseInt (   args [ 0 ] [ 1 ]   ,   10   )

    // Check if either number is greater than 8.
    if   (   a   >   8   ||   b   >   8   )   {
        // If the condition is met, print a sad face.
        console . log (   ':('   )
    }
    else   {
        // Otherwise, print a happy message.
        console . log (   'Yay!'   )
    }
} /* End of main function definition */



// This section handles reading input from stdin and calling the main function.
// It uses Node.js 'fs' module to read the file synchronously.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )   )

// End of file.