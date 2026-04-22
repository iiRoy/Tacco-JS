/*
 * This file contains a JavaScript program designed to solve a specific problem.
 * The 'input' parameter to the Main function will receive all the necessary data.
 * This initial comment provides an overview of the file's purpose.
 */
function   Main   (   input   )   {

    // The raw 'input' string is typically multi-line.
    // We split it by the newline character to process each line individually.
    // For this particular problem, it seems only the first line of input is used.
    input   =   input.split (   "\n"   )   ;


    // Declare a variable 'L' using 'var'.
    // We parse the first element of the 'input' array (which is the first line)
    // into an integer. This value represents the total length, often denoted as 'L'.
    var   L   =   parseInt (   input   )   ;

    // Declare another variable 'l' using 'var'.
    // This variable 'l' is calculated as one-third of the total length 'L'.
    // This calculation is common in problems related to maximizing volume given a fixed perimeter.
    var   l   =   L   /   3   ;


    // Finally, we calculate the cube of 'l' (l * l * l).
    // This result is then printed to the standard output using 'console.log'.
    // The problem likely asks for the maximum volume of a cube when its total edge length is 'L'.
    console.log (   (   l   *   l   *   l   )   )   ;

}   // End of the function definition for 'Main'.


/*
 * This block of code handles the standard input/output operations.
 * It's a common boilerplate for competitive programming in Node.js environments.
 * IMPORTANT: Please do not modify any code from this line onwards.
 * The script reads the entire content from standard input ('/dev/stdin'),
 * converts it to a UTF-8 string, and then passes it to the 'Main' function.
 */
Main (   require (   "fs"   )   .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;