function ProcessStringData( rawInputText )
{
    // The initial input string is first prepared by removing any leading or trailing whitespace.
    const cleanedContent = rawInputText.trim();

    // We then proceed to evaluate the cleaned string for specific repeating character sequences.
    // The evaluation is prioritized from the longest sequence to the shortest.

    if (cleanedContent.includes("RRR")) // Check for the presence of three consecutive 'R's.
    {
        console.log(3); // If found, output the maximum count.
    }
    else if (cleanedContent.includes("RR")) // Otherwise, check for two consecutive 'R's.
    {
        console.log(2); // If found, output the medium count.
    }
    else if ( cleanedContent.includes("R") ) // If neither of the above, check for a single 'R'.
    {
        console.log(1); // If found, output the minimum count.
    }
    else // If no 'R' sequence of any length is detected.
    {
        console.log(0); // Output zero, indicating no matching patterns.
    }
}


// Initiate the text processing by reading data from the standard input stream.
ProcessStringData(
    require('fs').readFileSync(
        "/dev/stdin",
        "utf8"
    )
);