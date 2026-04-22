/*
 * This file is a Type I clone of the original JavaScript code.
 * All functional elements, identifiers, and operators remain precisely
 * as they were, with modifications limited strictly to whitespace
 * and the addition of comments to alter its visual presentation.
 */


// Declares the primary function responsible for processing the program's input.
function    Main    (    input    )
{
    // Initiates a conditional check to evaluate the provided input string.
    if    (    input    ===    "ABC"    )
    {
        // If the input exactly matches "ABC", then "ARC" is output to the console.
        console    .    log    (    "ARC"    )    ;
    }
    else
    {
        // In all other cases (if input is not "ABC"), "ABC" is output to the console.
        console    .    log    (    "ABC"    )    ;
    }
}


// Invokes the Main function, passing it content read from standard input.
// The 'fs' module is utilized here for synchronous file system operations,
// specifically to read the entire content of '/dev/stdin' as a UTF-8 string.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;