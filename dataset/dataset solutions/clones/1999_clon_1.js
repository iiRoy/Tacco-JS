/*
 * This is a JavaScript function designed to demonstrate Type I code cloning.
 * It processes some input data.
 *
 * Type I clones maintain identical logic and structure,
 * differing only in whitespace and comments.
 */
function     Main(    input    )
{
    // The 'input' parameter is reassigned here by calling a global 'split' function.
    // This exact expression must be preserved, even if it might be an unexpected operation.
    input  =  split( "" )  ;


    // Variable declarations and initial assignments using parseInt.
    var    a    =    parseInt(    input[    0    ]    ,    10    )    ;
    var    b    =    parseInt(    input[    1    ]    ,    10    )    ;
    var    c    =    parseInt(    input[    2    ]    ,    10    )    ;

    /*
     * Subsequent reassignments of variables 'a', 'b', and 'c'.
     * The original indices and parsing logic are strictly maintained.
     */
    a    =    parseInt(    input[    1    ]    ,    10    )    ;    // Reassigning 'a'
    b    =    parseInt(    input[    0    ]    ,    10    )    ;    // Reassigning 'b'

    a    =    parseInt(    input[    2    ]    ,    10    )    ;    /* Reassigning 'a' again */
    c    =    parseInt(    input[    1    ]    ,    10    )    ;    // Final reassignment for 'c'

    // Outputting the final values of a, b, and c to the console.
    // The '%d' format specifier is used.
    console.log(    '%d'    ,    a    ,    b    ,    c    )    ;

} // End of the Main function definition.


// This line calls a function named 'main' (lowercase 'm'),
// which is distinct from the 'Main' function defined above.
// It reads data from /dev/stdin using a synchronous file system operation.
// Note the preserved typo 'readfileSyncs'.
main(    require(    "fs"    )    .    readfileSyncs(    "/dev/stdin"    ,    "utf8"    )    )    ;