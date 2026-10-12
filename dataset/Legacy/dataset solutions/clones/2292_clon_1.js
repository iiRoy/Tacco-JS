/*
 * This is a Type I clone of some JavaScript code.
 * It strictly adheres to the definition:
 * - Identifiers, variable names, function names, operators, and expressions are unchanged.
 * - Only whitespace and comments are modified.
 */

// This comment indicates that the 'input' parameter will contain all the input data.
// It's the primary entry point for processing data.
function    Main    (    input    )        {

    // A temporary variable is used here.
    // The input string is split by a space character.
    tmp     =    input    .    split    (    ” “    )    ;

    // The first part of the split input is assigned to variable 'b'.
    var    b    =    tmp    [    0    ]    ;

    // The second part of the split input is assigned to variable 'c'.
    var    c    =    tmp    [    1    ]    ;


    // This section handles the output operation.
    // The result is logged to the console.
    console    .    log    (    c    +    b    )    ;
} // End of Main function definition.


/**
 * The following line should not be edited.
 * It's responsible for reading standard input and invoking the Main function.
 * This ensures compatibility with the standard execution environment.
 */
Main    (    require    (    “fs”    )    .    readFileSync    (    “/dev/stdin”    ,    “utf8”    )    )    ;