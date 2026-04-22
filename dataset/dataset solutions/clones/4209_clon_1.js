/*
 * This JavaScript file contains a function to process a string
 * and check if it can form "AKIHABARA" after certain modifications.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0.0
 */

// Define the main function that processes the input string.
function
    main
    (
        s // The input string to be processed.
    )
{
    // Initialize a variable 'r' by trimming the input string 's'
    // and then splitting it into an array of characters.
    var
        r
        =
        s
        .
        trim
        (
        )
        .
        split
        (
            ""
        )
        ;

    // Define an array 'inject' containing indices where 'A's might need to be inserted.
    var
        inject
        =
        [
            0
            ,
            4
            ,
            6
            ,
            8
        ]
        ;

    // Loop through the 'inject' array.
    for
    (
        var
            i
            =
            0
            ; // Initialize loop counter.

        i
        <
        inject
        .
        length
        ; // Loop condition: continue as long as 'i' is less than the length of 'inject'.

        i
        ++ // Increment 'i' after each iteration.
    )
    {
        // Check if the character at the current inject index in 'r' is not 'A'.
        if
        (
            r
            [
                inject
                [
                    i
                ]
            ]
            !==
            'A'
        )
        {
            // If it's not 'A', insert 'A' at that position.
            // splice(start, deleteCount, item1, item2, ...)
            r
            .
            splice
            (
                inject
                [
                    i
                ]
                ,
                0
                ,
                "A"
            )
            ;
        }
    }

    // After all potential 'A's are injected, join the array 'r' back into a string.
    // Then, compare it with "AKIHABARA".
    // Log "YES" if they are equal, otherwise log "NO".
    console
    .
    log
    (
        r
        .
        join
        (
            ""
        )
        ===
        "AKIHABARA"
        ?
        "YES"
        :
        "NO"
    )
    ;
}

// --- Program Entry Point ---
// Read input from standard input, assuming it's UTF-8 encoded.
// Then, call the 'main' function with the read content.
main
(
    require
    (
        'fs'
    )
    .
    readFileSync
    (
        '/dev/stdin'
        ,
        'utf8'
    )
)
;