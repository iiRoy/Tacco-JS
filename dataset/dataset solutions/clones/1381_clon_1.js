/*
 * This JavaScript code defines a function 'Main'
 * that processes an input string.
 * It's designed to be executed in a Node.js environment,
 * reading from standard input.
 */

// Define the main processing function.
function  Main
(
  input
)
{
    // The core logic:
    // 1. Split the input string by newline characters.
    // 2. Remove the first element (line) from the resulting array.
    // 3. Sort the remaining elements alphabetically.
    // 4. Access the very first element of the sorted array.
    // 5. Print this element to the console.
    console . log
    (
        input
            .
        split
        (
            "\n"
        )
            .
        slice
        (
            1
        )
            .
        sort
        (
        )
            [
                0
            ]
    )
    ; // End of console.log statement
}


// --- Program Execution Start ---

// Read the entire content of standard input synchronously.
// The '/dev/stdin' path is standard for Node.js on Linux/macOS
// to access standard input.
// 'utf8' specifies the character encoding.
// The read content is then passed to the 'Main' function.
Main
(
    require
    (
        "fs"
    )
    .
    readFileSync
    (
        "/dev/stdin"
        ,
        "utf8"
    )
)
; // End of Main function call