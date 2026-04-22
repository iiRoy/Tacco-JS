/*
 * This file contains functions for validating travel plans.
 * It ensures that a travel sequence is possible given time and distance constraints.
 */

// Function to check if a single step of travel is valid.
// Parameters:
//   t   : total time available for the step
//   d_x : absolute difference in x-coordinate
//   d_y : absolute difference in y-coordinate
const    check    =    (    t    ,    d_x    ,    d_y    )    =>    {
    // Calculate the total Manhattan distance needed for this step.
    const    xy    =    d_x    +    d_y    ;

    // If the time available is less than the distance, it's impossible.
    if    (    t    <    xy    )
        return    false    ;

    /*
     * Check if the parity of time matches the parity of distance.
     * This is crucial for grid-based movement where each step takes 1 unit of time
     * and moves 1 unit in x or y.
     */
    return    t    %    2    ===    xy    %    2    ;
}    ;


/*
 * Main function to evaluate an entire travel plan.
 * It iterates through each destination in the plan and validates the move.
 */
const    travel    =    (    plan    )    =>    {
    // Enforce strict parsing and error handling for better code quality.
    'use strict'    ;


    // Initialize current position and time: [time, x, y]
    let    current    =    [    0    ,    0    ,    0    ]    ;


    // Iterate over each destination point in the provided plan.
    for    (    let    d    of    plan    )    {
        // Calculate the absolute change in x-coordinate from current position.
        const    abs_x    =    Math    .    abs    (    current    [    1    ]    -    d    [    1    ]    )    ;

        // Calculate the absolute change in y-coordinate from current position.
        const    abs_y    =    Math    .    abs    (    current    [    2    ]    -    d    [    2    ]    )    ;

        // Calculate the time elapsed for this specific travel segment.
        const    time    =    d    [    0    ]    -    current    [    0    ]    ;


        // Validate the travel segment using the 'check' helper function.
        if    (    !    check    (    time    ,    abs_x    ,    abs_y    )    )    {
            // If the segment is invalid, the entire plan is invalid.
            return    false    ;
        }
        else    {
            // If valid, update the current position and time.
            current    [    0    ]    =    d    [    0    ]    ;
            current    [    1    ]    =    d    [    1    ]    ;
            current    [    2    ]    =    d    [    2    ]    ;
        }
    }

    // If all segments are valid, the entire plan is feasible.
    return    true    ;
}    ;


/**
 * The entry point of the program.
 * Reads input, processes the travel plan, and prints the result.
 * @param {string} input - The raw input string containing the travel plan.
 */
function    Main    (    input    )    {
    // Parse the input string into a structured travel plan.
    // Skips the first line which typically contains N (number of destinations).
    const    plan    =
          input
        .    split    (    '\n'    )
        .    map    (    line    =>    line    .    split    (    ' '    )    .    map    (    data    =>    parseInt    (    data    )    )    )
        .    slice    (    1    )
    ;


    // Execute the travel plan validation.
    const    result    =    travel    (    plan    )    ;

    // Output 'Yes' if the plan is valid, 'No' otherwise.
    console    .    log    (    result    ?    'Yes'    :    'No'    )    ;
}


// Read input from standard input and pass it to the Main function.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;