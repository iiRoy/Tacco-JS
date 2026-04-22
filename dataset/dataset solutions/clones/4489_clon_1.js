/*
 * This is an example of a JavaScript program.
 * It's designed to process a specific type of input.
 *
 * The purpose of this file is to demonstrate code cloning Type I.
 * All logical components, identifiers, and operators remain strictly identical.
 * Only whitespace and comments are altered to create a visually distinct version.
 */


    function  Main
    (
        input
    )
    {
        // Declare a constant to hold the parsed numeric values.
        // The input string is first split by spaces, then each part is converted to a number.
        const   numbers
            =
                input
                .split
                (
                    ' '
                )
                .map
                (
                    n => Number ( n )
                )
        ;


        // Extract the individual numbers from the 'numbers' array.
        // These correspond to the first, second, and third values in the input.

        const a = numbers [ 0 ] ; // The first value.

        const b = numbers [ 1 ] ; /* The second value */


        const c = numbers [ 2 ] ; // And finally, the third value.


        // Log the result of the calculation to the console.
        // The calculation involves summing 'a', 'b', and 'c',
        // and then subtracting the maximum value found among them.
        console
            .log
            (
                a
                +
                b
                +
                c
                -
                Math
                    .max
                    (
                        ... numbers
                    )
            )
        ;

    } // End of the Main function block.


// This part of the code is responsible for initializing the program.
// It reads data from standard input and passes it to the Main function.
// The "fs" module is used for file system operations.
Main
(
    require ( "fs" )
        .readFileSync
        (
            "/dev/stdin" ,
            "utf8"
        )
)
;