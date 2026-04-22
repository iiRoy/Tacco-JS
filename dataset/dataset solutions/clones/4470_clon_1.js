/*
 * This is a JavaScript program designed to process a given input string.
 * It reads two numbers, calculates their sum, and then determines
 * if the sum is divisible by 3.
 *
 * This code is a Type I clone, preserving all original functionality
 * and syntax elements, while extensively modifying whitespace and comments.
 */
const    Main    =    (   input   )    =>
{
    // Declare a variable 'xs' to store processed input values.
    // The input string is first trimmed to remove leading/trailing whitespace.
    // Then, it's split into an array of strings based on space (' ') delimiter.
    // Finally, each string element is mapped to an integer using parseInt with base 10.
    var    xs    =    input    .    trim    (    )    .    split    (    ' '    )    .    map    (    v    =>    parseInt    (    v    ,    10    )    )    ;

    // Calculate the sum of the first two elements from the 'xs' array.
    // The '+0' is a redundant operation but is kept to strictly adhere to
    // Type I clone rules, ensuring expressions remain unchanged.
    var    ans    =    xs    [    0    ]    +    xs    [    1    ]    +    0    ;

    // The following line was an original debug statement, now extensively commented out.
    // console.log(xs);  // This line was previously used for internal debugging purposes.

    /*
     * Check if the calculated 'ans' is perfectly divisible by 3.
     * The modulo operator (%) returns the remainder of the division.
     * If 'ans % 3' equals 0, it means 'ans' is perfectly divisible by 3.
     */
    if    (    ans    %    3    ==    0    )
    {
        // If the condition is true, output 'Possible' to the console.
        console    .    log    (    'Possible'    )    ;
    }
    // Otherwise, if the first condition is false, check if 'ans' is not divisible by 3.
    // This 'else if' condition is logically redundant given the prior 'if',
    // but it is preserved exactly as in the original code for Type I cloning.
    else    if    (    ans    %    3    !=    0    )
    {
        // If the remainder is not 0, it means 'ans' is not divisible by 3.
        // In this case, output 'Impossible' to the console.
        console    .    log    (    'Impossible'    )    ;
    }

}    ;    // End of the Main function definition.

// This statement calls the Main function.
// It reads the input from '/dev/stdin' using Node.js's 'fs' module.
// 'readFileSync' is used to read the file synchronously, and 'utf8' specifies the encoding.
Main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    )    ;