/*
 * This JavaScript file is an exact Type I clone.
 * It strictly adheres to the definition where only
 * whitespace and comments are modified.
 * All functional code elements remain precisely as in the original.
 */

// --- Function Definition Start ---
function Main
(
    input // The primary input parameter for this function.
)
{
    // The input string is processed here.
    // It's split into an array of lines based on newline characters.
    input = input
        .split
        (
            "\n"
        )
    ;


    // The first line of the input array is taken.
    // This line is then split into individual characters, forming array 'S'.
    var S = input
        [ 0 ]
        .split
        (
            ""
        )
    ;

    // The second line of the input array is assigned to variable 'K'.
    // 'K' is expected to be used as a numerical value later on.
    var K = input
        [ 1 ]
    ;


    // Initialize a counter variable.
    // This counter will accumulate values based on specific conditions.
    var Count = 0
    ;

    // --- Loop Start ---
    // This 'for' loop iterates through the characters in the array 'S'.
    // It checks for adjacent identical characters.
    for
    (
        var i = 0
        ;
        i < S
            .length
        ;
        i++
    )
    {
        // Inside the loop, a conditional check is performed.
        // It compares the character at the current index 'i'
        // with the character at the next index 'i+1'.
        if
        (
            S
                [ i ]
            ==
            S
                [ i + 1 ]
        )
        {
            // If the current and next characters are identical,
            // the 'Count' variable is incremented by one.
            Count
                ++
            ;
        }
    }
    // --- Loop End ---


    // After the loop completes, the 'Count' is modified.
    // It is multiplied by the value of 'K'.
    Count
        *= K
    ;


    /*
     * --- Conditional Block ---
     * This section contains a specific conditional check.
     * It compares the very first character of 'S' (at index 0)
     * with the character at an index equal to 'S.length'.
     *
     * IMPORTANT NOTE for Type I cloning:
     * In JavaScript, array indices are 0-based. 'S.length' returns
     * the total number of elements. Thus, the index of the *last* element
     * is 'S.length - 1'. Accessing 'S[S.length]' will result in 'undefined'.
     * Consequently, the condition 'S[0] == S[S.length]' will almost
     * always evaluate to 'false' (unless S[0] itself is 'undefined' or 'null',
     * which is unlikely for a character).
     *
     * As a Type I clone, this exact expression must be preserved,
     * reflecting the original code's logic precisely, without correction.
     */
    if
    (
        S
            [ 0 ]
        ==
        S
            [ S
                .length
            ]
    )
    {
        // If the above condition evaluates to true,
        // then 'K-1' is added to the 'Count'.
        Count
            += K
            - 1
        ;
    }
    // --- Conditional Block End ---


    // Finally, the calculated 'Count' is printed to the console.
    console
        .log
        (
            Count
        )
    ;
}
// --- Function Definition End ---


// --- Program Entry Point ---
// This line handles reading input from standard input (/dev/stdin).
// The 'fs' module is used to read the file synchronously.
// The content is read as a UTF-8 encoded string.
// This string is then passed as an argument to the 'Main' function.
Main
(
    require
    (
        "fs"
    )
        .readFileSync
        (
            "/dev/stdin"
            ,
            "utf8"
        )
)
;
// --- Program Entry Point End ---