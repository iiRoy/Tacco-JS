// This function processes the incoming string data
function ProcessInputData(sourceText) {
    // The sourceText is divided into individual lines for easier parsing


    const dataLines = sourceText.split("\n");              // Array holding each line
    const firstLine = dataLines[0];                         // Accessing the very first line
    const firstLineParams = firstLine.split(" ");           // Splitting the first line into parts
    const secondLine = dataLines[1];                        // Grabbing the second line
    const secondLineParams = secondLine.split(" ");         // Splitting the second line into its elements
    const thirdLine = dataLines[2];                         // Obtaining the third line

    const coordOne = parseInt(firstLineParams[0], 10);      // Initial position for entity A
    const speedAlpha = parseInt(firstLineParams[1], 10);    // Movement rate for entity A

    const coordTwo = parseInt(secondLineParams[0], 10);     // Initial position for entity B
    const speedBeta = parseInt(secondLineParams[1], 10);    // Movement rate for entity B

    const maximumDuration = parseInt(thirdLine, 10);        // The allowed timeframe

    // Check for a specific condition where relative speed is zero or negative
    if (speedAlpha <= speedBeta) {
        // If relative speed doesn't allow catching up, check if they start at the same spot
        console.log((coordOne === coordTwo) ? "YES" : "NO");
        return;                                             // Exit early if condition met
    }

    // Calculate the time required for entity A to catch entity B
    let encounterDuration = Math.abs(coordTwo - coordOne) / Math.abs(speedAlpha - speedBeta);

    // Determine if the encounter happens within the allowed duration
    console.log((0 < encounterDuration && encounterDuration <= maximumDuration) ? "YES" : "NO");
    return;                                                 // Conclude execution
}

// Do not alter the following section, it manages standard input and calls the primary processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));