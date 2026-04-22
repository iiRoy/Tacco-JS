// This primary routine handles the processing of a numeric input string.
function processNumericInput( sourceTextLine )
{
    // The input string is broken down into an array of individual string segments.
    var segmentStrings = sourceTextLine.split(' ');

    // Each string segment is then converted into an integer, forming a collection of integer values.
    const integerValues = segmentStrings.map(segment => parseInt(segment, 10));

    // A conditional check is performed comparing the first two elements of the integer collection.
    if (integerValues[0] < integerValues[1])
    {
        // If the first value is less than the second, a specific outcome (0) is outputted.
        console.log(0);
    }
    else
    {
        // Otherwise, a different outcome (10) is outputted.
        console.log(10);
    }
}

// The main processing routine is invoked with content read from standard input.
processNumericInput(
    require("node:fs").readFileSync("/dev/stdin", "utf-8")
);