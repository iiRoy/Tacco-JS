// Function designed to handle the primary processing of incoming textual data
function processInputData(rawData)
{
    // First, eliminate any leading or trailing whitespace from the provided raw input string.
    let cleanedData = rawData.trim();


    // Now, split the refined string into multiple parts based on space delimiters.
    // Each part is then converted into a numerical value.
    // These numerical segments are subsequently destructured into distinct variables.
    const [firstStringSegment, middleStringSegment, lastStringSegment] = cleanedData.split(" ") .map(Number);

    // Evaluate a compound condition to determine the output:
    // Check if the very last character of the initial segment matches the first character of the middle segment,
    // AND concurrently, if the last character of the middle segment aligns with the first character of the final segment.
    if ( (firstStringSegment.slice(-1) == middleStringSegment.slice(0, 1)) && (middleStringSegment.slice(-1) == lastStringSegment.slice(0, 1)) )
    {
        // Should both conditions be satisfied, print a positive confirmation.
        console.log("YES");
    }
    else
    {
        // Otherwise, if the conditions are not met, print a negative response.
        console.log("NO");
    }

} // Termination of the processInputData routine


// The entry point for execution:
// Synchronously read all content from the standard input stream, interpreting it as UTF-8 encoded text.
// Subsequently, this acquired content is passed as an argument to our main processing function.
processInputData( require("fs") .readFileSync( "/dev/stdin", "utf8" ) );