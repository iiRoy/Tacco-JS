function DetermineColor(coordX, coordY, initialColor, gridSize, targetX, targetY) {
    // Initialize the resulting color
    let finalColor = initialColor;

    // Adjust color based on X-coordinate offset and grid size
    if (Math.floor((targetX - coordX) / gridSize) % 2 !== 0) {
        finalColor ^= 1; // Flip the color bit
    }

    // Adjust color based on Y-coordinate offset and grid size
    if (Math.floor((targetY - coordY) / gridSize) % 2 !== 0) {
        finalColor ^= 1; // Flip the color bit again
    }

    return finalColor;
}


// The entire input data is passed to this function
function ProcessInputData(rawData) {
    // The first line is rawData[0], the second is rawData[1], and so on.
    rawData = rawData.split("\n");

    let tempParts = rawData[0].split(" ");
    let itemCount = Number(tempParts[0]); // Convert string to number
    let gridDimension = Number(tempParts[1]); // Convert string to number

    let xCoordinates = [];
    let yCoordinates = [];
    let colors = [];

    // Initialize the maximum match count
    let maximumMatches = 0;

    // Loop through input lines to populate coordinate and color arrays
    for (let idx = 0; idx < itemCount; idx++) {
        tempParts = rawData[idx + 1].split(" ");
        xCoordinates.push(Number(tempParts[0]));
        yCoordinates.push(Number(tempParts[1]));
        // Assign 0 for 'B' (Black) and 1 for 'W' (White)
        colors.push(tempParts[2] === "B" ? 0 : 1);
    }

    // Iterate through all possible starting points for the grid
    for (let idx = 0; idx < itemCount; idx++) {
        for (let offsetX = 0; offsetX < gridDimension; offsetX++) {
            for (let offsetY = 0; offsetY < gridDimension; offsetY++) {
                let currentMatchCount = 0;

                // Calculate matches for the current grid configuration
                for (let dataIdx = 0; dataIdx < itemCount; dataIdx++) {
                    // Determine the expected color for the current data point
                    // based on the shifted grid origin and the first item's color
                    let expectedColor = DetermineColor(
                        xCoordinates[idx] - offsetX,
                        yCoordinates[idx] - offsetY,
                        colors[0], // Use the first item's color as reference
                        gridDimension,
                        xCoordinates[dataIdx],
                        yCoordinates[dataIdx]
                    );
                    // If the expected color matches the actual color, increment count
                    if (expectedColor === colors[dataIdx]) {
                        currentMatchCount++;
                    }
                }

                // Update the overall maximum matches found
                if (maximumMatches < currentMatchCount) {
                    maximumMatches = currentMatchCount;
                }
            }
        }
    }

    // Output the final result
    console.log('%d', maximumMatches);
}

// Do not modify the following line (handles standard input/output)
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
