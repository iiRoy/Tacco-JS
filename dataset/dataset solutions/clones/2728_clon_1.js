// This is an extensively modified introductory comment section.
// It aims to provide a different perspective on the code's functionality.
//
// The primary goal of this JavaScript program is to process some
// numerical input and then perform a specific calculation.
//
// The code adheres to a common structure found in online programming challenges.

function
    Main
    (
        input
    )
{

    // The initial input, which is a single string, is first broken down.
    // It's assumed that different pieces of data are separated by newlines.
    // This operation transforms the single string into an array of strings.
    input
        =
        input
            .split
            (
                "\n"
            )
    ;


    // Next, the first line of the now-array-based input is targeted.
    // This specific line is expected to contain one or more values
    // that are themselves separated by space characters.
    tmp0
        =
        input
            [
                0
            ]
            .split
            (
                " "
            )
    ;


    // From the space-separated values obtained from the first line,
    // the very first value is extracted. This value is then explicitly
    // converted into a numerical type, ensuring it can be used in arithmetic.
    r
        =
        Number
        (
            tmp0
            [
                0
            ]
        )
    ;


    // Finally, a mathematical operation is performed using the extracted number 'r'.
    // The result of this calculation (3 * r * r) is then printed to the standard output.
    console
        .log
        (
            3
            *
            r
            *
            r
        )
    ;

} // This curly brace marks the official end of the 'Main' function's definition.

/*
 *  --------------------------------------------------------------------------
 *  IMPORTANT: DO NOT MODIFY THE CODE BELOW THIS LINE.
 *  --------------------------------------------------------------------------
 *  This section is a standard boilerplate for competitive programming.
 *  It handles the interaction with the standard input/output streams.
 *  Specifically, it reads all available data from '/dev/stdin' (standard input)
 *  using 'utf8' encoding and then passes this entire content to the 'Main' function.
 *  Any alterations here would prevent the program from running correctly
 *  within the typical automated judge environment.
 */
Main
(
    require
    (
        "fs" // The Node.js 'fs' (file system) module is used here.
    )
    .readFileSync
    (
        "/dev/stdin" , // Specifies the standard input file path.
        "utf8"         // Defines the character encoding for reading the file.
    )
)
;
// The previous test line 'Main("4\n");' has been removed to streamline the code.