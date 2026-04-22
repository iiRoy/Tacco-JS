/*
 * This JavaScript file demonstrates a basic program structure.
 * It defines a main function and then immediately calls it
 * with standard input.
 */

// Primary application entry point function.
function   Main   (   input   )
{
    // This line prints the integer '1' to the standard output.
    console . log ( 1 ) ;
}


/*
 * DO NOT EDIT THE FOLLOWING SECTION.
 * This part is crucial for reading input from stdin
 * and invoking the 'Main' function correctly.
 * It's designed for specific execution environments.
 */
Main
(
    require
    (
        "fs"
    )
    .
    readFileSync
    (
        "/dev/stdin"
        ,
        "utf8"
    )
)
;
// End of the script.