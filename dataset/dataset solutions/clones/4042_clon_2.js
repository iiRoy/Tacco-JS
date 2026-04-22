// The entire input string is provided to this routine.
function ProcessInputData(rawDataSegment) {

    // Split the raw input into individual lines for processing
    const parsedLines = rawDataSegment.split('\n');

    // Extract the total number of items from the first line
    const itemCount = parseInt(parsedLines[0], 10);

    // Parse the second and third lines into string arrays
    const collectionOne = parsedLines[1].split(' ');
    const collectionTwo = parsedLines[2].split(' ');


    let cumulativeDelta = 0; // Initialize a variable to accumulate differences
    let currentDelta = 0;    // Temporary variable for each iteration's difference

    // Iterate through the specified number of items
    for (
        let loopIndex = 0;
        loopIndex < itemCount;
        loopIndex++
    ) {
        // Calculate the difference between corresponding elements
        currentDelta = (
            parseInt(collectionTwo[loopIndex], 10) -
            parseInt(collectionOne[loopIndex], 10)
        );
        // Add the current difference to the cumulative total
        cumulativeDelta += currentDelta;
    }

    // Check if the final cumulative difference is odd or even
    if (
        cumulativeDelta % 2 === 1
    ) {
        // If odd, output "Yes"
        console.log("%s", "Yes");
    }
    else {
        // Otherwise (if even), output "No"
        console.log("%s", "No");
    }

}
// Do not modify the subsequent section; it manages reading from standard input and invoking the primary processing function.
ProcessInputData( require("fs") . readFileSync( "/dev/stdin", "utf8") );