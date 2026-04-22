// This module handles processing of a textual data stream.
function processDataStream(incomingText)
{
    // First, clean up the raw input and split it into individual lines.
    let parsedLines = incomingText
        .trim()
        .split("\n")
    ;

    // Extract the primary numeric target from the first line.
    // The parseInt function will automatically handle the array of strings
    // by using the first element after implicit coercion to string.
    const overallTarget = parseInt(
        parsedLines[0].split(" "),
        10
    ) ;

    // Initialize a counter for summing up values from the second line.
    let accumulatedQuantity = 0;

    // Iterate through the numeric strings on the second line
    // and add their integer values to the accumulator.
    parsedLines[1] .split(" ")
        .forEach( currentNumericString => {
            accumulatedQuantity += parseInt(
                currentNumericString,
                10
            );
        })
    ; // End of forEach loop

    // Perform a comparison to determine the final output.
    if (overallTarget - accumulatedQuantity < 0) {
        // If the difference is negative, indicate an invalid state.
        console.log(-1);
    }
    else
    {
        // Otherwise, print the calculated remaining value.
        console.log(
            overallTarget - accumulatedQuantity
        );
    }
} // End of function processDataStream

// Invoke the main processing function with data read from standard input.
processDataStream(
    require("fs") .readFileSync(
        "/dev/stdin",
        "utf8"
    )
);