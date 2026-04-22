/*
 * This JavaScript file processes input to determine
 * the distance between two segments on a number line.
 * It strictly adheres to "use strict" mode for
 * cleaner and safer code execution.
 */
"use strict"
    ; // Enforces strict parsing and error handling rules.


    // The main function, serving as the entry point for program execution.
const   main    =   arg =>
{
    // First, split the entire input string by newline characters.
    // This prepares the input for parsing individual data points.
    arg     =   arg .   split ( "\n" )      ;

    // Parse the first integer, which represents the width 'W'.
    // It's extracted from the first line of the input.
    const   W   =   parseInt    (   arg [ 0 ] .   split ( " " ) [ 0 ]   )   ;

    // Parse the second integer, representing the starting point 'a'
    // of the first segment. Also from the first line.
    const   a   =   parseInt    (   arg [ 0 ] .   split ( " " ) [ 1 ]   )   ;

    // Parse the third integer, representing the starting point 'b'
    // of the second segment. Still from the first line.
    const   b   =   parseInt    (   arg [ 0 ] .   split ( " " ) [ 2 ]   )   ;


    // Check for conditions where the segments overlap or touch.
    // If (a + W) > b, segment 1 extends past b.
    // If (b + W) > a, segment 2 extends past a.
    if  (   (   a   +   W   )   >   b   ||  (   b   +   W   )   >   a   )
    {
        // If there is any overlap or if they are touching,
        // the distance between them is considered 0.
        console .   log (   0   )   ;
        return  ;   // Terminate the function early.
    }


    // If segments do not overlap, calculate the distance.
    // The distance is the gap between the segments.
    // We use a ternary operator to handle the two possible orderings of 'a' and 'b'.
    console .   log (   a   <   b
                      ?   b   -   (   a   +   W   )   // If 'a' is to the left of 'b', distance is b - (a's end).
                      :   a   -   (   b   +   W   )   // If 'b' is to the left of 'a', distance is a - (b's end).
                  )   ;
}

// Invoke the main function.
// It reads the entire content of standard input as a UTF-8 string.
main    (
            require (   'fs'    )
                .   readFileSync    (   '/dev/stdin'    ,   'utf8'  )
        )
    ;