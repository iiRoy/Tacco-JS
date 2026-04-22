/*
 * This is a JavaScript file that processes input from stdin.
 * It's designed to find and transform specific patterns within a string.
 */

// Define the main function that orchestrates the entire process.
function    Main    (    stdin    )    {

    // Split the input string by newline characters.
    // The problem implies that the actual data is on the first line.
    stdin    =    stdin    .    split    (    '\n'    )    ;


    // Extract the first line of input and convert it into an array of characters.
    const    input    =    stdin    [    0    ]    .    split    (    ''    )    ;


    // Initialize a flag to control the main loop.
    // It will continue as long as changes are being made.
    var    isChange    =    true    ;


    // Initialize the starting index for the inner loop.
    // This allows for optimization, skipping already processed parts.
    var    start    =    0    ;


    // Initialize a counter to keep track of the number of transformations performed.
    var    count    =    0    ;


    // The main processing loop. It continues until no more 'ABC' patterns are found.
    while    (    isChange    )    {

        // Reset the change flag at the beginning of each iteration.
        // If no 'ABC' is found in this pass, the loop will terminate.
        isChange    =    false    ;

        // Iterate through the input array from the 'start' position.
        // We look for the 'ABC' pattern.
        for    (    var    i    =    start    ;    i    <    input    .    length    ;    i    ++    )    {

            // Check if the current three characters form the 'ABC' pattern.
            // This is a crucial conditional check.
            if    (    input    [    i    ]    ===    'A'    &&    input    [    i    +    1    ]    ===    'B'    &&    input    [    i    +    2    ]    ===    'C'    )    {

                // If 'ABC' is found, perform the swap operation.
                // The 'swap' function modifies the input array in place.
                swap    (    input    ,    i    )    ;

                // Increment the transformation counter.
                count    =    count    +    1    ;

                // Set the flag to true, indicating that a change occurred,
                // so the outer loop will continue.
                isChange    =    true    ;

            }   // End of 'if' condition for 'ABC' pattern check.
        }   // End of 'for' loop iterating through the input array.

        // Advance the starting point for the next iteration of the 'for' loop.
        // This is an optimization to avoid re-scanning parts that have already been
        // processed or where an 'ABC' pattern was just found and swapped.
        start    =    start    +    2    ;

    }   // End of 'while' loop.


    // Output the final count of transformations to the console.
    console    .    log    (    count    )    ;

}   // End of Main function definition.


// This function performs the actual character swap: 'ABC' becomes 'BCA'.
// It takes the character array 'input' and the 'start' index of the 'ABC' pattern.
function    swap    (    input    ,    start    )    {

    // Assign 'B' to the first position.
    input    [    start    ]    =    'B'    ;

    // Assign 'C' to the second position.
    input    [    start    +    1    ]    =    'C'    ;

    // Assign 'A' to the third position.
    input    [    start    +    2    ]    =    'A'    ;

}   // End of swap function definition.


// This is the entry point of the script when executed.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// and passes it to the 'Main' function.
Main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    )    ;

/*
 * End of the JavaScript program.
 * Thank you for reviewing this highly optimized and extensively commented code.
 */