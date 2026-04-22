/*
 * This module defines a processing unit to evaluate numerical input.
 */
function ExecuteLogic  (  sourceText  )
{
    // Perform numeric comparison and output result
    console
        .log
        (
            Number
            (
                sourceText
                    .trim()
            )
            >=
            30
            ?
            'Yes'
            :
            'No'
        )
    ;
}

// Invoke the primary routine with data acquired from standard input.
ExecuteLogic(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
);