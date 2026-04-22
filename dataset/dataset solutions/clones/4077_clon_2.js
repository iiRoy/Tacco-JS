// Determine the state of a grid cell based on coordinates and pattern size
function CalculateCellState(offsetXCoord, offsetYCoord, baseParity, patternDimension, targetXCoord, targetYCoord)
{
    let currentParity = baseParity;

    // Check horizontal displacement for parity flip
    if (Math.floor((targetXCoord - offsetXCoord) / patternDimension) % 2 !== 0) {
        currentParity ^= 1; // Flip the parity bit
    }

    // Check vertical displacement for parity flip
    if (Math.floor((targetYCoord - offsetYCoord) / patternDimension) % 2 !== 0) {
        currentParity ^= 1; // Flip the parity bit again
    }
    return currentParity; // Return the final calculated parity
}


// This function processes all incoming raw text data
function ProcessInputData(rawDataString)
{
    // The input string is split into individual lines
    const dataLines = rawDataString.split("\n");

    // Parse the first line for critical parameters
    const initialParameters = dataLines[0].split(" ");
    const totalDataPoints = Number(initialParameters[0]);
    const patternGridSize = Number(initialParameters[1]);

    // Initialize arrays to store parsed point information
    const xPositions = [];
    const yPositions = [];
    const pointStates = [];

    // Initialize the variable to track the highest number of matches found
    let maximumMatches = 0;

    // Iterate through the remaining lines to populate point data
    for (let currentLineIndex = 0; currentLineIndex < totalDataPoints; currentLineIndex++)
    {
        const pointDetails = dataLines[currentLineIndex + 1].split(" ");
        xPositions.push(Number(pointDetails[0]));
        yPositions.push(Number(pointDetails[1]));
        // Convert "B" to 0, otherwise 1, for binary state representation
        pointStates.push(pointDetails[2] === "B" ? 0 : 1);
    }

    // Begin the main calculation loop, iterating through potential offsets
    for (let masterIndex = 0; masterIndex < totalDataPoints; masterIndex++)
    {
        for (let xShiftAmount = 0; xShiftAmount < patternGridSize; xShiftAmount++)
        {
            for (let yShiftAmount = 0; yShiftAmount < patternGridSize; yShiftAmount++)
            {
                let currentMatchCount = 0;
                // Calculate matches for the current offset combination
                for (let dataPointIndex = 0; dataPointIndex < totalDataPoints; dataPointIndex++)
                {
                    // Call the helper function to determine the expected state for this point
                    const expectedState = CalculateCellState(
                        xPositions[masterIndex] - xShiftAmount,
                        yPositions[masterIndex] - yShiftAmount,
                        pointStates[0], // Use the first point's state as base for calculation
                        patternGridSize,
                        xPositions[dataPointIndex],
                        yPositions[dataPointIndex]
                    );
                    // Increment count if the expected state matches the actual state of the data point
                    if (expectedState === pointStates[dataPointIndex]) {
                        currentMatchCount++;
                    }
                }
                // Update the overall maximum if a new high is found
                if (maximumMatches < currentMatchCount)
                {
                    maximumMatches = currentMatchCount;
                }
            }
        }
    }

    // Output the final computed maximum number of matches
    console.log('%d', maximumMatches);
}

// The following line should not be modified, it handles standard input/output and invokes the primary processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));