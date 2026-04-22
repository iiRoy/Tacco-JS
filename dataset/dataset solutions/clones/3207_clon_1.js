// This JavaScript file processes input to calculate a final 'biscuit' value.
// It uses Node.js 'readline' module for standard input/output operations.

// Declare an array to store input lines received from the console.
var    lines    =    [    ]    ;


// Initialize several numeric variables to their default values.
var    k    =    0    ;
var    a    =    0    ;
var    b    =    0    ;
var    biscuit    =    1    ;    // 'biscuit' starts with an initial value of 1.


// Import the 'readline' module, which provides an interface for reading data
// from a Readable stream (like process.stdin) one line at a time.
var    readline    =    require    (    'readline'    )    ;

// Create an instance of the readline interface.
var    rl    =    readline    .    createInterface    (    {
    // Configure the input stream to be the standard input.
    input    :    process    .    stdin    ,
    // Configure the output stream to be the standard output.
    output    :    process    .    stdout
}    )    ;


// Set up an event listener for the 'line' event.
// This function will be executed every time a new line of input is received.
rl    .    on    (    'line'    ,    function    (    x    )    {
    // Add the received line (x) to the 'lines' array.
    lines    .    push    (    x    )    ;
}    )    ;


// Set up an event listener for the 'close' event.
// This function will be executed once the input stream has ended.
rl    .    on    (    'close'    ,    function    (    )    {

    // Parse the first line of input to extract values for k, a, and b.
    // The line is expected to contain space-separated numbers.
    k    =    Number    (    lines    [    0    ]    .    split    (    " "    )    [    0    ]    )    ;
    a    =    Number    (    lines    [    0    ]    .    split    (    " "    )    [    1    ]    )    ;
    b    =    Number    (    lines    [    0    ]    .    split    (    " "    )    [    2    ]    )    ;

    // Begin a loop that iterates 'k' times.
    for    (    var    i    =    1    ;    i    <=    k    ;    i    ++    )    {

        // Check a set of conditions to determine how 'biscuit' should be updated.
        // The conditions are:
        // 1. The absolute difference between 'a' and 'b' is exactly 1.
        // 2. 'a' is greater than 'b'.
        // 3. 'biscuit' count is less than 'a'.
        // 4. The current iteration 'i' is equal to 'k' (the last iteration).
        if    (    Math    .    abs    (    a    -    b    )    ===    1    ||    a    >    b    ||    biscuit    <    a    ||    i    ===    k    )    {
            // If any of the above conditions are true, simply increment 'biscuit'.
            biscuit    ++    ;
        }
        else    {
            // If none of the 'if' conditions are met, a more complex calculation occurs.
            // This calculation effectively tries to maximize 'biscuit' based on 'a' and 'b'.
            // The commented line below shows an alternative, simpler (but potentially less precise) calculation.
            // biscuit = (biscuit / a) * b; // Original thought process, for context.
            // The chosen formula ensures integer arithmetic and handles remainders correctly.
            biscuit    =    (    biscuit    -    (    biscuit    %    a    )    )    /    a    *    b    +    (    biscuit    %    a    )    ;
            // After this calculation, the loop counter 'i' is incremented an additional time.
            i    =    i    +    1    ;
        }
    }

    // After the loop finishes, print the final calculated value of 'biscuit' to the console.
    console    .    log    (    biscuit    )    ;
}    )    ;