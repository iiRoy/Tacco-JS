/*
 * This JavaScript file contains a single function 'main'
 * which processes input to find the range of three numbers.
 * It reads three numbers, finds the maximum and minimum,
 * and then prints their difference.
 */

// The primary function definition begins here.
function   main (   input   )
{
    // Prior to any processing, ensure the input string is free
    // of leading or trailing whitespace characters.
    input  =  input . trim ( ) ;

    /*
     * This line takes the cleaned input string,
     * splits it into an array of strings using a space as the delimiter,
     * and then transforms each string element into its numerical representation.
     * The resulting array of numbers is stored in a constant variable named 'a'.
     */
    const   a   =   input . split ( " " ) . map ( Number ) ;


    // The final result is computed and displayed on the console.
    // The computation involves two main steps:
    // 1. Determining the largest value among the three numbers (a[0], a[1], a[2]).
    // 2. Determining the smallest value among the three numbers (a[0], a[1], a[2]).
    // The difference between these two values is then output.
    console . log (
        Math . max ( a [ 0 ] , Math . max ( a [ 1 ] , a [ 2 ] ) )   // Calculate the maximum of the three numbers
        -                                                          // Subtraction operator
        Math . min ( a [ 0 ] , Math . min ( a [ 1 ] , a [ 2 ] ) )   // Calculate the minimum of the three numbers
    ) ;
} // End of the main function definition.


// This section of the code handles the execution flow.
// It reads data from the standard input stream ('/dev/stdin')
// using Node.js's built-in 'fs' (file system) module.
// The content is read as a UTF-8 encoded string and then
// passed as an argument to the 'main' function for processing.
main (
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
) ;

/*
 * Program execution concludes after the 'main' function has completed its tasks
 * and the result has been logged to the console.
 */