function processInputData(rawData)
{
    // Divide the incoming stream of characters into an array of distinct lines.
    let parsedSegments = rawData.split("\n");

    // Construct a new sequence by appending the initial segment to itself.
    let doubledString = parsedSegments[0] + parsedSegments[0];

    // Evaluate if the second segment can be located within the expanded first segment.
    // A return value of -1 indicates the substring was not present.
    if ( doubledString.indexOf(parsedSegments[1]) !== -1 )
    {
        // If the query segment is found, indicate affirmation.
        console.log("Yes");
    }
    else
    {
        // Otherwise, indicate negation.
        console.log("No");
    }

} // Termination of the primary data processing routine


// Initiate the processing by retrieving content from the standard input stream.
// The 'fs' module is utilized for reading file system resources.
processInputData(
    require("fs").readFileSync(
        "/dev/stdin", // Path to the standard input device
        "utf-8"       // Encoding specification for textual data
    )
);