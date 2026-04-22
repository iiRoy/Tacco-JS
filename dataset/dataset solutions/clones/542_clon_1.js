/*
 * This script is designed to perform a specific mathematical operation.
 * It reads input, processes it, and then outputs a calculated value.
 *
 * Author:   Code Clone Generator
 * Version:  1.0
 * Date:     2023-10-27
 */

    // First, we obtain the necessary module for file system operations.
    // Then, we read the content from the standard input file.
    var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;


    // The input string is expected to contain two space-separated numbers.
    // We trim any leading/trailing whitespace, split the string by space,
    // and convert each part into a numerical value.
    // Finally, we destructure the resulting array into two variables, 'a' and 'b'.
    var   [ a ,   b ]   =   input . trim ( ) . split ( " " ) . map ( Number ) ;


    // The core logic involves calculating the ceiling of the division of 'b' by 'a'.
    // Math.ceil() ensures that any fractional result is rounded up to the nearest whole number.
    // The final result is then printed to the standard output console.
    console . log ( Math . ceil ( b   /   a ) ) ;


/*
 * Script execution finished.
 * Output has been generated successfully.
 */