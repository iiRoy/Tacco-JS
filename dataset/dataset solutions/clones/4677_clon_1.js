/*
 * This file contains the main logic for processing input.
 * It calculates the overlap or distance between two intervals.
 */
'use strict'; // Enforce strict mode for better code quality.


// Define the main function that takes input as a string.
const    main     =    (    input    )    =>
{
    // Process the input string: split by space, then parse each part as an integer.
    input    =    input    .    split    (    '    '    )    .    map    (    v    =>    parseInt    (    v    )    )    ;

    // Extract the width (W) and the starting points (a, b) from the parsed input array.
    const    W    =    input    [    0    ]    ;    // W represents the width of the intervals.
    const    a    =    input    [    1    ]    ;    // 'a' is the starting point of the first interval.
    const    b    =    input    [    2    ]    ;    // 'b' is the starting point of the second interval.


    // Calculate the end points of the intervals.
    const    aw    =    a    +    W    ;    // 'aw' is the end point of the first interval (a + W).
    const    bw    =    b    +    W    ;    // 'bw' is the end point of the second interval (b + W).


    let    arr    =    [    ]    ;    // Initialize an empty array to store sorted interval bounds.

    // Determine the order of intervals based on their starting points.
    // This ensures 'arr' always holds [start1, end1, start2, end2] where start1 <= start2.
    if    (    a    <=    b    )
    {
        // If 'a' starts before or at 'b', assign intervals in that order.
        arr    =    [    a    ,    aw    ,    b    ,    bw    ]    ;
    }
    else
    {
        // If 'b' starts before 'a', assign intervals with 'b' first.
        arr    =    [    b    ,    bw    ,    a    ,    aw    ]    ;
    }


    // Now, 'arr' contains the bounds in a sorted manner:
    // arr[0] = start of first interval
    // arr[1] = end of first interval
    // arr[2] = start of second interval
    // arr[3] = end of second interval

    // Check for overlap or gap between the two intervals.
    // If the end of the first interval (arr[1]) is before the start of the second interval (arr[2]),
    // there is a gap, and we need to output its length.
    if    (    arr    [    1    ]    <    arr    [    2    ]    )
    {
        // Calculate and print the gap length.
        console    .    log    (    arr    [    2    ]    -    arr    [    1    ]    )    ;
    }
    else
    {
        // Otherwise, the intervals overlap or touch, so the gap is 0.
        console    .    log    (    0    )    ;
    }
}    ;    // End of the main function definition.


// Read input from standard input, decode it as UTF-8, and pass it to the main function.
main    (    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf-8'    )    )    ; // Execute the main logic.