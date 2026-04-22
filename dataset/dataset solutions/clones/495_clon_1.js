/*
 * This JavaScript code snippet demonstrates a dynamic programming solution
 * for a problem that involves state transitions and event handling.
 * It reads input from standard input, processes it iteratively,
 * and prints a calculated result.
 */


var    input    =    require('fs')    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    ;


// The input string is first trimmed to remove leading/trailing whitespace,
// then split into an array of lines based on the newline character.
var    arr    =    input    .    trim    (    )    .    split    (    "\n"    )    ;


// The main processing loop continues indefinitely until a specific
// termination condition is met within the loop body.
while    (    true    )    {


    // Each iteration starts by parsing the first line of the 'arr' array.
    // This line is expected to contain three space-separated numbers (x, y, z).
    var    xyz    =    arr    .    shift    (    )    .    split    (    " "    )    .    map    (    Number    )    ;


    // Check if the current set of xyz values indicates the end of input.
    // The condition is met if all three values are zero.
    if    (    xyz    .    join    (    " "    )    ===    "0 0 0"    )    {
        break    ; // Exit the while loop.
    }


    // Extract the individual components from the 'xyz' array.
    var    x    =    xyz    [    0    ]    ; // Represents a divisor or number of options.
    var    y    =    xyz    [    1    ]    ; // Represents a target state or limit.
    var    z    =    xyz    [    2    ]    ; // Represents the number of special events.


    // Read the next line, which contains an array 'v' of numbers.
    // These numbers likely represent possible step sizes or transitions.
    var    v    =    arr    .    shift    (    )    .    split    (    " "    )    .    map    (    Number    )    ;


    // Initialize an array 'nea' to store details about special events.
    // 'nea' acts as a map where the index is a state and the value is an event.
    var    nea    =    [    ]    ;


    // Populate the 'nea' array based on 'z' subsequent lines of input.
    // Each line describes an event associated with a particular state.
    for    (    var    i    =    0    ;    i    <    z    ;    i    ++    )    {
        var    Z    =    arr    .    shift    (    )    .    split    (    " "    )    .    map    (    Number    )    ;
        // The first element of Z is the state, the next two are event type and amount.
        nea    [    Z    [    0    ]    ]    =    [    Z    [    1    ]    ,    Z    [    2    ]    ]    ;
    }


    // Initialize the dynamic programming table 'dp'.
    // This table will store probabilities or counts for reaching certain states.
    var    dp    =    [    ]    ;


    // Initialize the 'dp' table with dimensions (y+1) by 5001, all zeros.
    // The second dimension (5001) suggests a maximum value of 5000.
    for    (    var    i    =    0    ;    i    <=    y    ;    i    ++    )    {
        dp    [    i    ]    =    [    ]    ; // Each row is a new array.
        for    (    var    j    =    0    ;    j    <=    5000    ;    j    ++    )    {
            dp    [    i    ]    [    j    ]    =    0    ; // Set initial value to zero.
        }
    }


    // Set the base case for the dynamic programming calculation.
    // This typically represents the starting point or initial condition.
    dp    [    0    ]    [    0    ]    =    1    ;


    // Begin the main dynamic programming calculation loops.
    // The outer loop iterates through states 'i' up to 'y'.
    for    (    var    i    =    0    ;    i    <    y    ;    i    ++    )    {


        // The inner loop iterates through 'x' possible transitions from state 'i'.
        for    (    var    j    =    0    ;    j    <    x    ;    j    ++    )    {


            // Calculate the 'after' state by adding a step 'v[j]' to the current state 'i'.
            var    after    =    i    +    v    [    j    ]    ;


            // Ensure that the 'after' state does not exceed the maximum allowed state 'y'.
            if    (    after    >    y    )    {
                after    =    y    ; // Cap the state at 'y'.
            }


            // Iterate through the second dimension 'k' (up to 5000).
            // This 'k' likely represents some accumulated value or resource.
            for    (    var    k    =    0    ;    k    <=    5000    ;    k    ++    )    {


                // Check if there is a special event associated with the 'after' state.
                if    (    nea    [    after    ]    !=    undefined    )    {


                    var    e    =    nea    [    after    ]    [    0    ]    ; // Event type (1, 2, or 3).
                    var    a    =    nea    [    after    ]    [    1    ]    ; // Event amount.


                    // Apply logic based on the event type 'e'.
                    if    (    e    ===    1    )    {
                        // Event type 1: Adjust the 'after' state by 'a'.
                        dp    [    after    +    a    ]    [    k    ]    +=    dp    [    i    ]    [    k    ]    /    x    ;
                    }
                    else    if    (    e    ===    2    )    {
                        // Event type 2: Adjust the 'k' value by 'a'.
                        dp    [    after    ]    [    k    +    a    ]    +=    dp    [    i    ]    [    k    ]    /    x    ;
                    }
                    else    if    (    e    ===    3    )    {
                        // Event type 3: Decrease 'k' by 'a', but not below zero.
                        if    (    k    -    a    <    0    )    {
                            a    =    k    ; // Adjust 'a' to prevent 'k' from going negative.
                        }
                        dp    [    after    ]    [    k    -    a    ]    +=    dp    [    i    ]    [    k    ]    /    x    ;
                    }
                }
                else    {
                    // If no special event exists for 'after' state,
                    // simply transition to 'after' state with current 'k' value.
                    dp    [    after    ]    [    k    ]    +=    dp    [    i    ]    [    k    ]    /    x    ;
                }
            }
        }
    }


    // Calculate the final sum based on the probabilities in the 'dp' table
    // at the target state 'y' and weighted by the 'k' values.
    var    sum    =    0    ;
    for    (    var    i    =    0    ;    i    <=    5000    ;    i    ++    )    {
        sum    +=    i    *    dp    [    y    ]    [    i    ]    ;
    }


    // Print the floor of the calculated sum to the console.
    console    .    log    (    Math    .    floor    (    sum    )    )    ;
}

// End of the main program logic.