/*
 * This is a JavaScript program.
 * It defines a main function to process input.
 * The program reads input from standard input,
 * parses two numbers, and performs a calculation based on them.
 */

// Define the main function that takes 'input' as its argument.
function    Main   (   input   )
{

    // Split the input string by newline characters.
    // This creates an array where each element is a line from the input.
    input    =    input.split   (   "\n"   )   ;

    /*
     * Take the first line of the input array.
     * Split this line by spaces to get individual string components.
     * This assumes the numbers are on the first line, separated by a space.
     */
    inputStr    =    input   [   0   ]   .split   (   " "   )   ;

    // Convert the first string component to an integer and assign it to constant A.
    const    A    =    Number.parseInt   (   inputStr   [   0   ]   )   ;

    // Convert the second string component to an integer and assign it to constant B.
    const    B    =    Number.parseInt   (   inputStr   [   1   ]   )   ;


    // Check if both A and B are within the range of 1 to 9 (inclusive).
    if    (    A    <=    9    &&    B    <=    9    )
    {
        // If both conditions are true, print the product of A and B to the console.
        console.log   (   A    *    B   )   ;
    }
    else
    {
        // If either A or B (or both) are not within the specified range,
        // print -1 to the console as an indicator of an invalid input scenario.
        console.log   (   -1   )   ;
    }

} // End of the Main function definition.

/*
 * Call the Main function.
 * The argument to Main is obtained by:
 * 1. Requiring the 'fs' (file system) module.
 * 2. Using 'readFileSync' to read the content of '/dev/stdin' (standard input).
 * 3. Specifying 'utf8' encoding for the read content.
 */
Main   (   require   (   "fs"   )   .readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// This marks the end of the script.