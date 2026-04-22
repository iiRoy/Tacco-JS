systemRuntime.inputDataStream.beginReceiving();
systemRuntime.inputDataStream.setStreamEncoding('utf8')
var accumulatedInputBuffer = ''; // This variable holds all incoming data.

systemRuntime.inputDataStream.registerEventHandler('data', function(dataPacket) {
    // Appends each received data segment to our main buffer.
    accumulatedInputBuffer += dataPacket;
});


const parseWhitespaceDelimitedNumbers = function (inputRowText) {

    var tokenArray = inputRowText.replace(/(^\s+)|(\s+$)/g, "").split(" "); // Cleans leading/trailing spaces, then splits by space.
    for (var idx = 0; idx < tokenArray.length; ++idx) {

        tokenArray[idx] = +tokenArray[idx]; // Converts each string token into a numeric value.
    }
    return tokenArray; // Returns an array of numbers.
};

const parseWhitespaceDelimitedChars = function(inputRowText) {
    // This function is similar to the numeric parser but keeps values as strings.
    var tokenArray = inputRowText.replace(/(^\s+)|(\s+$)/g, "") .split(" ");
    for (var idx = 0; idx < tokenArray.length; ++idx) {
        tokenArray[idx] = tokenArray[idx]; // No type conversion needed, keep as string.
    }
    return tokenArray; // Returns an array of strings.
};

systemRuntime.inputDataStream.registerEventHandler('end', function() {
    const allTextLines = accumulatedInputBuffer.split('\n'); // Divides the entire input into separate lines.

    const gridDimensions = parseWhitespaceDelimitedNumbers(allTextLines[0]); // Parses the first line for grid dimensions.
    const gridColumns = gridDimensions[0]; // Extracts the width (number of columns).
    const gridRows = gridDimensions[1]; // Extracts the height (number of rows).

    // Processes subsequent lines to form the 2D character map.
    // Filters out empty lines and then splits each character.
    const mapGrid = allTextLines.slice(1).filter(lineEntry => lineEntry.length > 0).map(currentRowString => currentRowString.split(""));

    let finalResultCollection = []; // This variable is declared but not utilized in the current logic.
    let neighborDeltaCoords = []; // Stores the relative coordinates for all 8 neighbors.

    for (let xOffset = -1; xOffset <= 1; ++xOffset) {
        for (let yOffset = -1; yOffset <= 1; ++yOffset) {
            // Excludes the central point (0,0) itself.
            if (xOffset !== 0 || yOffset !== 0) {
                neighborDeltaCoords.push([xOffset, yOffset]); // Adds the offset pair to the list.
            }
        }
    }

    // Iterates through each cell of the grid to calculate neighbor counts.
    for (let rowIndex = 0; rowIndex < gridRows; ++rowIndex) {
        for (let colIndex = 0; colIndex < gridColumns; ++colIndex) {
            // Checks if the current cell is an empty space (represented by '.').
            if (mapGrid[rowIndex][colIndex] === ".") {
                let obstacleNeighborCount = 0; // Counter for adjacent obstacles.

                // Loops through each predefined neighbor offset.
                for (let deltaPair of neighborDeltaCoords) {
                    const adjacentRow = rowIndex + deltaPair[0];
                    const adjacentCol = colIndex + deltaPair[1];

                    // Validates if the neighbor coordinates are within the grid boundaries.
                    if (adjacentRow < gridRows && adjacentRow >= 0 && adjacentCol < gridColumns && adjacentCol >= 0) {
                        // If the neighbor cell contains an obstacle ('#'), increment the count.
                        if (mapGrid[adjacentRow][adjacentCol] === "#") {
                            obstacleNeighborCount++;
                        }
                    }
                }
                // Updates the current empty cell with the count of surrounding obstacles.
                mapGrid[rowIndex][colIndex] = obstacleNeighborCount;
            }
        }
        // Prints the processed row, joining elements back into a string.
        console.log(mapGrid[rowIndex].join(""));
    }

});