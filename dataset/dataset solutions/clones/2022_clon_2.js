// This module defines a function to perform a sequence of numeric transformations.
function processData( entryValue )
{
    // The 'currentAccumulator' variable is used in the first iterative process.
    // Its initial state is assumed, mirroring the original's 'tmp' variable.
    while
    (
        currentAccumulator
        >=
        entryValue
    )
    {
        currentAccumulator
        +=
        500; // Increment the accumulator by a fixed amount.
    }

    // Compute an intermediate value for the final output.
    finalOutput
    =
    currentAccumulator
    *
    2;

    // The 'loopCounter' variable controls the second iterative process.
    // Its initial state is assumed, mirroring the original's 'tmp2' variable.
    while
    (
        loopCounter
        >=
        entryValue
        -
        currentAccumulator
    )
    {
        loopCounter
        +=
        5; // Add a smaller constant to the loop counter.
    }

    // Integrate the value of the loop counter into the final output.
    finalOutput
    +=
    loopCounter;

    // Display the final calculated numerical output.
    console
        .
        log
        (
            "%d",
            finalOutput
        )
    ;
}


// The script execution starts here, reading from standard input.
// It uses the Node.js 'fs' module to synchronously read the entire file.
processData
(
    require("fs")
        .
        readFileSync
        (
            "/dev/stdin",
            "utf8"
        )
)
;