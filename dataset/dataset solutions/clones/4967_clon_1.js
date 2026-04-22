/*
 * This is a JavaScript function designed to perform a specific calculation.
 * It reads input, processes it, and then prints the result.
 * This particular code calculates the area of a trapezoid.
 */
function         Main    (    input    )
{
    // The input string is expected to be multi-line.
    // We split it by newline characters to get individual lines.
    input     =     input.split(    "\n"    )    ;

    // Parse the first line as a number. Subtracting 0 is a common and explicit way
    // to coerce a string to a number in JavaScript, ensuring numerical operation.
    const     a     =     input[0]     -     0     ;

    // Parse the second line as a number. This represents the second parallel side.
    const     b     =     input[1]     -     0     ;

    // Parse the third line as a number. This represents the height of the trapezoid.
    const     h     =     input[2]     -     0     ;


    // Calculate the area of a trapezoid using the formula: (sum of parallel sides) * height / 2
    // And then print the resulting area to the console.
    console.log    (    (    a     +     b    )     *     h     /     2    )    ;

} // End of the Main function definition.


/*
 * !!! IMPORTANT: Do not modify the code below this line.
 * This section handles standard input/output operations for the program.
 * It reads all available data from standard input at once and then calls the Main function
 * to process the input data.
 */
Main    (    require    (    "fs"    )    .readFileSync    (    "/dev/stdin"    ,     "utf8"    )    )    ;


// This marks the end of the executable script.
// Any further content would be ignored or considered outside the main logic.