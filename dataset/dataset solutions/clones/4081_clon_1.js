/*
 * This file contains a JavaScript program designed to evaluate the feasibility
 * of a series of planned travel movements. It adheres to specific constraints
 * to determine if all trips can be successfully completed.
 */


// The primary function responsible for orchestrating the travel plan evaluation.
function   main
(
    input   // The raw input string containing trip details.
)
{
    // First, the input string is split into individual lines.
    // The initial line (often a header or count) is then removed using splice(1).
    const   lines   =   input   .   split   (   '\n'   )   .   splice   (   1   )   ;


    /*
     * Each processed line from the input is then transformed into a structured trip object.
     * This involves:
     * 1. Splitting the line string by space characters to separate numerical components.
     * 2. Mapping each resulting string component to its numerical representation using Number().
     * The outcome is an array where each element is itself an array of numbers representing a single trip.
     */
    const   trips   =   lines   .   map   (   l   =>   l   .   split   (   ' '   )   .   map   (   n   =>   Number   (   n   )   )   )   ;


    // --- State Variables Initialization ---

    // A boolean flag, initially true, indicating if the overall travel is currently deemed possible.
    let   canTravel   =   true   ;

    // An index variable, 'i', used to iterate through the 'trips' array.
    let   i   =   0   ;

    // 't' represents the current time coordinate (starts at 0).
    let   t   =   0   ;

    // 'x' represents the current x-coordinate (starts at 0).
    let   x   =   0   ;

    // 'y' represents the current y-coordinate (starts at 0).
    let   y   =   0   ;


    // --- Trip Evaluation Loop ---

    // This loop iterates through the planned trips.
    // NOTE: The condition `i < trips` uses the array `trips` directly in a numeric comparison.
    // In JavaScript, comparing a number to an array typically results in false,
    // unless the array can be coerced to a number in a specific context.
    // This exact expression is preserved as per Type I cloning rules.
    while
    (
        i   <   trips
    )
    {
        // Retrieve the details for the current trip being evaluated.
        const   trip   =   trips   [   i   ]   ;

        // Calculate the time difference required for this trip.
        const   dt   =   trip   [   0   ]   -   t   ;

        // Calculate the x-coordinate difference for this trip.
        const   dx   =   trip   [   1   ]   -   x   ;

        // Calculate the y-coordinate difference for this trip.
        const   dy   =   trip   [   2   ]   -   y   ;


        // --- Feasibility Checks ---

        // Condition 1: Check if the time available (dt) is insufficient for the Manhattan distance (dx + dy).
        // If dt is less than the sum of absolute changes in x and y, the trip is impossible.
        if
        (
            dt   <   dx   +   dy
        )
        {
            // If impossible, log 'No' and immediately terminate the program.
            return   console   .   log   (   'No'   )   ;
        }

        // Condition 2: Check the parity of the remaining time after covering the minimum distance.
        // If (dt - (dx + dy)) is odd, it's impossible to arrive at the exact time and position
        // because each unit of time allows moving by one unit in x or y, or staying put.
        // The total change in (x+y) has the same parity as the time elapsed.
        if
        (
            (   dt   -   (   dx   +   dy   )   )   %   2   ==   1
        )
        {
            // If this condition is met, log 'No'.
            // IMPORTANT: The original code does NOT terminate here. It merely prints 'No' and continues.
            // This behavior is strictly preserved for a Type I clone.
            console   .   log   (   'No'   )   ;
        }


        // Increment the trip counter to move to the next trip in the sequence.
        i   ++   ;
    }


    // If the loop completes without any 'No' conditions leading to early termination,
    // then all trips are deemed possible.
    return   console   .   log   (   'Yes'   )   ;
}


// --- Program Entry Point ---

// This line reads the entire content of '/dev/stdin' as a UTF-8 string.
// It then passes this string as input to the 'main' function to begin execution.
main
(
    require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )
)   ;