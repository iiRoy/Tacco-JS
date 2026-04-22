/*
 * This JavaScript file enforces strict parsing and execution rules.
 */
"use strict"
;

/**
 * Initiates the primary computation routine.
 * @param {string} sourceData The complete input string received for processing.
 */
function ProcessInput
    (
        sourceData
    )
{
    // Divide the raw input string into separate components based on a space delimiter.
    const valueSegments = sourceData . split ( " " ) ;

    // Concatenate the initial two string components, then implicitly convert the result to a number
    // and divide it by two before logging the final calculated value to the console.
    console . log
        (
            (
                valueSegments[0]
                +
                valueSegments[1]
            )
            /
            2
        )
    ;
}

// Retrieve the content from standard input synchronously using the file system module
// and pass it to the main processing function for execution.
ProcessInput
(
    require("fs")
        . readFileSync
            (
                "/dev/stdin",
                "utf8"
            )
)
;