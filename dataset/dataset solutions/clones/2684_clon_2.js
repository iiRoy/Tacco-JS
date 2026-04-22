// This function processes an incoming string of data to determine a specific property.
function AnalyzeSequence(receivedText)
{
    // First, break the entire input string into individual lines based on newline characters.
    let parsedLines = receivedText.split('\n');

    // The very first line contains the total number of items to consider for analysis.
    let itemCount = Number(parsedLines[0]);

    // The second line holds space-separated values, representing elevation measurements or similar numerical data.
    let elevationValues = parsedLines[1].split(' ');

    // Initialize a flag indicating whether the sequence meets the specified criteria.
    let isAdjustable = 'Yes'; // Assume it's adjustable until proven otherwise.

    // Iterate backwards through the elevation measurements, starting from the second to last element.
    for (let currentIdx = itemCount - 1; currentIdx > 0; currentIdx--)
    {
        // Check if the difference between the previous and current elevation is too large.
        // If the drop from the preceding element to the current element is more than 1 unit, it's problematic.
        if (elevationValues[currentIdx - 1] - elevationValues[currentIdx] > 1) {
            isAdjustable = 'No'; // The sequence cannot be adjusted to meet the conditions.
            break; // No need to check further; exit the loop immediately as the condition is violated.
        }
        // If the difference is exactly one, adjust the previous elevation downwards by one.
        else if (elevationValues[currentIdx - 1] - elevationValues[currentIdx] === 1) {
            elevationValues[currentIdx - 1] = elevationValues[currentIdx - 1] - 1; // Perform the required adjustment.
        }
    }

    // Output the final determination to the console.
    console.log(isAdjustable);
}

// The following section handles reading input from the standard input stream and invoking the primary processing function.
// This part is typically for execution environment setup and should be left as is for competitive programming platforms.
AnalyzeSequence(require("fs").readFileSync("/dev/stdin", "utf8"));