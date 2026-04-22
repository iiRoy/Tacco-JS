/*
 * This JavaScript file contains a collection of utility functions
 * along with the main program logic. The primary goal is to process
 * text input from standard input, specifically extracting characters
 * from a string at regular, user-defined intervals.
 */


// Utility function: `toInt`
// This function is designed to convert a given input `x` into an integer.
// It explicitly uses base 10 (decimal) for parsing to ensure consistency.
var    toInt    =    x    =>    parseInt    (    x    ,    10    )    ;


// Utility function: `toIntArr`
// This function takes an array `arr` (presumably of strings) and transforms
// it into an array of integers. It achieves this by applying the `toInt`
// function to each element of the input array.
var    toIntArr    =    arr    =>    arr    .    map    (    x    =>    toInt    (    x    )    )    ;


// Utility function: `abs`
// This simple function calculates the absolute value of a number `x`.
// It uses a ternary operator: if `x` is positive, it returns `x`; otherwise,
// it returns the negation of `x`.
var    abs    =    x    =>    x    >    0    ?    x    :    -x    ;


/**
 * Utility function: `min`
 * This function determines the minimum value among all the arguments passed to it.
 * It can accept a variable number of arguments.
 *
 * @returns {number} The smallest numerical value provided in the arguments.
 */
function    min    (    )
{
    // 'arguments' is a special local variable available within all non-arrow functions,
    // containing all parameters passed to the function.
    var    rest    =    arguments    ;

    // Initialize 'val' with the first argument. This will be our current minimum.
    var    val    =    rest    [    0    ]    ;


    // Loop through the remaining arguments, starting from the second one (index 1).
    for    (    var    i    =    1    ;    i    <    rest    .    length    ;    i    ++    )
    {
        // If the current argument is less than the current minimum ('val'),
        // update 'val' to this new smaller value.
        if    (    rest    [    i    ]    <    val    )
        {
            val    =    rest    [    i    ]    ;
        }
    }

    // After checking all arguments, 'val' holds the overall minimum.
    return    val    ;
}


/**
 * Utility function: `max`
 * This function identifies the maximum value among all the arguments provided to it.
 * It is designed to handle an arbitrary number of inputs.
 *
 * @returns {number} The largest numerical value among the function's arguments.
 */
function    max    (    )
{
    // Access all arguments passed to this function.
    var    rest    =    arguments    ;

    // Set the initial maximum value to the first argument.
    var    val    =    rest    [    0    ]    ;


    // Iterate over the arguments, starting from the second one.
    for    (    var    i    =    1    ;    i    <    rest    .    length    ;    i    ++    )
    {
        // Compare the current argument with the stored maximum 'val'.
        // If the current argument is larger, update 'val'.
        if    (    rest    [    i    ]    >    val    )
        {
            val    =    rest    [    i    ]    ;
        }
    }

    // Return the highest value found.
    return    val    ;
}


// Program Entry Point:
// This line initiates the main execution flow. It reads all data from
// standard input (`/dev/stdin`) using Node.js's file system module,
// decodes it as UTF-8, and then passes the entire content as a string
// to the `Main` function.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;


/**
 * Main program function: `Main`
 * This function serves as the core logic for processing the input.
 * It takes a raw string input, splits it into lines, and then extracts
 * characters from the first line based on a step value provided in the second line.
 *
 * @param {string} input - The raw string content read from standard input.
 *                         Note: This parameter's value is reassigned within the function
 *                         to become an array of lines.
 */
function    Main    (    input    )
{
    // Reassign the 'input' variable. It was initially a single string,
    // and now it becomes an array where each element is a line from the original input.
    var    input    =    input    .    split    (    '\n'    )    ;

    // Extract the first line from the input array. This line is treated as the
    // primary string from which characters will be extracted.
    var    s    =    input    [    0    ]    ;

    // Extract the second line from the input array and convert it to an integer
    // using the `toInt` utility function. This integer `w` represents the
    // step size for character extraction.
    var    w    =    toInt    (    input    [    1    ]    )    ;

    // Determine the total length of the string `s`. This value `n` is used
    // as the upper bound for the loop that extracts characters.
    var    n    =    s    .    length    ;

    // Initialize an empty string named `ans`. This string will be used to
    // build up the result by concatenating selected characters from `s`.
    var    ans    =    ''    ;

    // Begin a loop that iterates through the string `s`.
    // The loop counter `i` starts at 0 and increments by `w` in each iteration,
    // effectively jumping through the string at fixed intervals.
    for    (    var    i    =    0    ;    i    <    n    ;    i    +=    w    )
    {
        // In each iteration, append the character at the current index `i` from
        // string `s` to the `ans` string.
        ans    +=    s    [    i    ]    ;
    }

    // Finally, print the accumulated result string `ans` to the console.
    // This is the program's output.
    console    .    log    (    ans    )    ;
}