// This JavaScript code processes input according to specific rules.
// It's typically invoked via Node.js, possibly redirecting a text file as standard input.
// For example: node B.js < B.txt

function    Main    (    input    )    {

    // The entire input string is first split into an array of strings,
    // where each element corresponds to a single line from the original input.
    // The first line will be input[0], the second input[1], and so on.
    input    =    input    .    split    (    '\n'    )    ; // Breaks down the input into an array of lines.

    // Initialize a variable 'ans' to store the cumulative result, starting at zero.
    var    ans    =    0    ;

    // Initialize a boolean 'flag' variable, which will control conditional logic within the loop.
    var    flag    =    false    ;

    // Begin a loop that iterates through the lines of the input array.
    // The loop starts from the second line (index 1) and continues up to
    // and including the line number specified by the very first line of the input (input[0]).
    for    (    var    i    =    1    ;    i    <    Number    (    input    [    0    ]    )    +    1    ;    i    ++    )    {

        // This block executes only if the 'flag' is currently false.
        if    (    !    flag    )
            // Inside this conditional, it checks if the current line (input[i])
            // contains a match for the content of the very last line of the input array.
            if    (    input    [    i    ]    .    match    (    input    [    input    .    length    -    1    ]    )    )    {
                // If a match is found, set the 'flag' to true.
                flag    =    true    ;
                // Immediately proceed to the next iteration of the loop, skipping any subsequent code in this iteration.
                continue    ;
            }

        // This block executes only if the 'flag' is currently true.
        // The 'flag' would be true if a match was found in a previous iteration.
        if    (    flag    )    {
            // Parse the second space-separated part of the current line as a number,
            // and add this number to the 'ans' variable.
            ans    +=    Number    (    input    [    i    ]    .    split    (    ' '    )    [    1    ]    )    ;
        }

    }

    // After the loop completes, print the final calculated answer to the console.
    console    .    log    (    ans    )    ;

}

// This line reads the entire content from standard input ('/dev/stdin')
// as a UTF-8 encoded string and then passes it to the Main function for processing.
Main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    )    ;