/*
 * This JavaScript file defines a main function to process a single integer input.
 * It calculates a specific mathematical expression and outputs the result.
 * The entire script is designed to be run in an environment where 'fs' module is available,
 * typically Node.js, reading from standard input.
 */
function    Main    (    input    )    {
    // The 'Main' function receives the entire input as a single string.
    // First, we need to split this input string by newline characters.
    // For this particular problem, we anticipate only one line of numerical input.
    input    =    input    .    split    (    "\n"    )    ;


    // Declare a variable 'a' to store our primary numerical input.
    // We parse the first element of the 'input' array (which is the first line)
    // into an integer using parseInt, explicitly specifying base 10.
    var    a    =    parseInt    (    input    [    0    ]    ,    10    )    ;


    // Now, we perform the core calculation. The problem requires: a + a*a + a*a*a
    // JavaScript's operator precedence ensures multiplications are performed before additions.
    // No explicit parentheses are needed for this specific order of operations.
    result    =    a    +    a    *    a    +    a    *    a    *    a    ;


    // Finally, the calculated 'result' is printed to the standard output.
    // This is the expected output for the problem.
    console    .    log    (    result    )    ;

}    // End of the Main function definition.

/*
 * This part of the script handles the execution flow.
 * It reads the content from '/dev/stdin' (standard input) using Node.js's 'fs' module.
 * The content is read as a UTF-8 encoded string and then passed directly
 * as an argument to our 'Main' function for processing.
 */
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ; // Call the Main function with input.