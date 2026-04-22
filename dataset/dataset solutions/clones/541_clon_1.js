/*
 * This JavaScript code is a Type I clone of a translation
 * from the original Java code provided.
 *
 * The original Java code's logic has been converted to JavaScript,
 * and then this JavaScript version has been extensively modified
 * in terms of whitespace and comments, while preserving
 * all identifiers, operators, and expressions exactly as they are
 * in the JavaScript translation.
 */

// Define a function to encapsulate the main logic,
// similar to the 'main' method in Java.
function
solve
(
)
{
    // In a production JavaScript environment (e.g., Node.js),
    // input would typically be read from 'process.stdin'
    // using modules like 'readline' or by parsing 'process.argv'.
    // For the purpose of this Type I clone and direct logic translation,
    // we will simulate the input line.
    let
        line
        =
        "10 30"
        ; // Example input string for demonstration.

    // Split the input string by spaces to obtain an array
    // of string representations of numbers.
    let
        numbers
        =
        line
        .
        split
        (
            " "
        )
        ;

    // Parse the first element of the 'numbers' array into an integer A.
    // The radix (base 10) is specified for robustness.
    let
        A
        =
        parseInt
        (
            numbers
            [
                0
            ]
            ,
            10
        )
        ;

    // Parse the second element of the 'numbers' array into an integer B.
    let
        B
        =
        parseInt
        (
            numbers
            [
                1
            ]
            ,
            10
        )
        ;

    // Perform the core calculation:
    // 1. Divide B by A.
    // 2. Take the floor of the result (equivalent to integer division for positive numbers).
    // 3. Add 1 to the final result.
    let
        num
        =
        Math
        .
        floor
        (
            B
            /
            A
        )
        +
        1
        ;

    // Output the calculated number to the console.
    // This is JavaScript's equivalent of Java's System.out.print.
    console
    .
    log
    (
        num
    )
    ;
} // End of the 'solve' function.

// To execute this logic in a script, one would typically call the 'solve' function.
// solve(); // This call is commented out as the request is for the code itself.