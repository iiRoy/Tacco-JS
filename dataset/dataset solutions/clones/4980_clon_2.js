// This script initializes standard input processing.
process.stdin.resume();
process.stdin.setEncoding('utf8'); // Using a different encoding for variety

let cachedInputBuffer = ""; // Accumulates all incoming data fragments
let processedInputLines = []; // Stores input data split by newline characters
let currentLineIndex = 0; // Tracks the current line being read from the processed input

// Event listener for incoming data chunks from standard input
process.stdin.on('data', function (dataChunk)
{
    cachedInputBuffer += dataChunk; // Append the received fragment to our buffer
});

// Event listener for an interrupt signal (e.g., Ctrl+C from the terminal)
process.on('SIGINT', function()
{
    // Upon receiving an interrupt, process all accumulated data
    processedInputLines = cachedInputBuffer.split("\n"); // Split the buffer into individual lines
    performPrimaryCalculation(); // Execute the core logic function of the program
    process.exit(0); // Terminate the process cleanly with an exit code of 0
});

// Event listener for the end of the standard input stream
process.stdin.on('end', function ()
{
    // When the input stream concludes, finalize data processing
    processedInputLines = cachedInputBuffer.split("\n"); // Split the entire buffer into lines
    performPrimaryCalculation(); // Invoke the main computational routine
});

// Utility function to retrieve the next line from the processed input collection
function fetchNextInputLine()
{
    return processedInputLines[currentLineIndex++]; // Return the current line and advance the pointer
}

/* --- Input Handling Subsystem End --- */


// The main computational routine of the program, where the core logic resides.
function performPrimaryCalculation()
{
    // A mapping object to store the counts of how many times each 3x3 square is affected
    let affectedCellCounts = {};

    // Read the first line of input, which contains grid dimensions and the number of points
    let dimensionData = fetchNextInputLine().split(" ");
    let totalRows = Number.parseInt(dimensionData[0]); // Height of the grid
    let totalCols = Number.parseInt(dimensionData[1]); // Width of the grid
    let totalMarkedPoints = Number.parseInt(dimensionData[2]); // Number of points to process

    // Iterate through each marked point provided in the subsequent input lines
    for (let currentPoint = 0; currentPoint < totalMarkedPoints; currentPoint++)
    {
        let pointCoordinates = fetchNextInputLine().split(" ");
        let centralRow = Number.parseInt(pointCoordinates[0]); // The row coordinate of the central point
        let centralCol = Number.parseInt(pointCoordinates[1]); // The column coordinate of the central point

        // This nested loop checks a 3x3 area around the central point.
        // It iterates through potential top-left row coordinates (rOffset) for a 3x3 square,
        // covering a range from (centralRow - 2) up to (centralRow).
        for (let rOffset = centralRow - 2; rOffset <= centralRow; rOffset++)
        {
            // Ensure the top-left corner's row (rOffset) is within the valid grid bounds for a 3x3 square.
            // A 3x3 square requires a top-left corner at least 1 and at most (totalRows - 2).
            if (rOffset >= 1 && rOffset <= totalRows - 2)
            {
                // This inner loop iterates through potential top-left column coordinates (cOffset) for a 3x3 square,
                // covering a range from (centralCol - 2) up to (centralCol).
                for (let cOffset = centralCol - 2; cOffset <= centralCol; cOffset++)
                {
                    // Ensure the top-left corner's column (cOffset) is within valid grid bounds.
                    // A 3x3 square requires a top-left corner at least 1 and at most (totalCols - 2).
                    if (cOffset >= 1 && cOffset <= totalCols - 2)
                    {
                        // Construct a unique key identifier for this specific 3x3 square's top-left corner.
                        let squareIdentifier = "R" + rOffset.toString() + "_C" + cOffset.toString();

                        // Increment the count for this specific 3x3 square in our map.
                        if (affectedCellCounts[squareIdentifier] === undefined)
                        {
                            affectedCellCounts[squareIdentifier] = 1; // Initialize count if this is the first time
                        }
                        else
                        {
                            affectedCellCounts[squareIdentifier]++; // Increment the existing count
                        }
                    }
                }
            }
        }
    }

    // Initialize an array to store the final distribution of impact counts (from 0 to 9 impacts)
    let finalDistribution = [];
    for (let idx = 0; idx < 10; idx++)
    {
        finalDistribution.push(0); // Populate the array with initial zeros
    }

    // Calculate the total number of possible 3x3 squares in the grid.
    // This value is initially assigned to `finalDistribution[0]`, representing squares with 0 impacts.
    // Note: The problem context typically implies 1-indexed grids for coordinates.
    finalDistribution[0] = (totalRows - 2) * (totalCols - 2);

    // Process the collected impact counts from the `affectedCellCounts` map
    for (let currentSquareKey in affectedCellCounts)
    {
        finalDistribution[0]--; // Decrement the count for squares with 0 impacts, as this square was affected.
        // Increment the tally for the specific impact count.
        // For example, if a square was impacted 3 times, `finalDistribution[3]` will be incremented.
        finalDistribution[affectedCellCounts[currentSquareKey]]++;
    }

    // Output the final distribution counts to the console
    for (let outcomeIndex = 0; outcomeIndex < 10; outcomeIndex++)
    {
        console.log(finalDistribution[outcomeIndex].toString()); // Convert the numeric count to a string before logging
    }
}