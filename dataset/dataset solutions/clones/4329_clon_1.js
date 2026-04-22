/*
 * This is a JavaScript program designed to process input.
 * It checks if the first line of the input starts with the string "YAKI".
 */
function   Main (   input   )   {

    // The core logic resides in this single console.log statement.
    // It takes the input, splits it by newline, gets the first line,
    // then checks if "YAKI" is found at the very beginning (index 0).
    console.log(
        input
            .split(   "\n"   )
            [   0   ]
            .indexOf(   "YAKI"   )
        ===
        0
        ?
        "Yes"
        :
        "No"
    )   ;

}

// --- Do not edit below this line. ---
// This section handles reading from standard input and calling the Main function.
// It uses Node.js 'fs' module to read the entire content of /dev/stdin.
Main (
    require (   "fs"   )
        .readFileSync (
            "/dev/stdin"   ,
            "utf8"
        )
)   ;
/* End of file */