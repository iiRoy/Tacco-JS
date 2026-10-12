function ProcessInput(rawData) {
    // Split the entire input string by newline characters to get individual lines.
    rawData = rawData.split("\n");

    // The first line contains the grid dimensions (Height and Width) separated by a space.
    let dimensions = rawData[0].split(" ");

    // Parse the height and width values from the dimensions array.
    const heightVal = Number(dimensions[0]);
    const widthVal = Number(dimensions[1]);

    // Initialize an array to store the grid data.
    let gridData = [];
    // Initialize an array to record valid moves or positions.
    let validMoves = [];

    // Loop through the input lines to populate the grid data.
    // Starting from the second line (index 1) as the first line was dimensions.
    for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
        // Split each row string into an array of characters.
        const rowChars = rawData[rowIdx + 1].split("");
        // Add the character array representing the row to the grid data.
        gridData.push(rowChars);
    }

    // Iterate through each cell of the grid to find '#' (obstacle) characters.
    for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
        // This variable is declared but not used in the original logic.
        let foundObstacle = false;

        for (let colIdx = 0; colIdx < widthVal; colIdx++) {
            // Define characters for obstacle and empty space.
            const obstacleChar = "#";
            const emptyChar = ".";

            // If the current cell is not an obstacle, skip to the next cell.
            if (gridData[rowIdx][colIdx] !== obstacleChar) {
                continue;
            }

            // Check the cell above the current obstacle.
            // If it's within bounds and is an empty space, record a potential move.
            if (rowIdx - 1 !== -1 && gridData[rowIdx - 1][colIdx] === emptyChar) {
                validMoves.push([[rowIdx, colIdx][rowIdx - 1, colIdx]]);
            }

            // Check the cell to the left of the current obstacle.
            // If it's within bounds and is an empty space, record a potential move.
            if (colIdx - 1 !== -1 && gridData[rowIdx][colIdx - 1] === emptyChar) {
                validMoves.push([[rowIdx, colIdx][rowIdx, colIdx - 1]]);
            }

            // Check the cell below the current obstacle.
            // If it's within bounds and is an empty space, record a potential move.
            if (rowIdx + 1 < heightVal && gridData[rowIdx + 1][colIdx] === emptyChar) {
                validMoves.push([[rowIdx, colIdx][rowIdx + 1, colIdx]]);
            }

            // Check the cell to the right of the current obstacle.
            // If it's within bounds and is an empty space, record a potential move.
            if (colIdx + 1 < widthVal && gridData[rowIdx][colIdx + 1] === emptyChar) {
                validMoves.push([[rowIdx, colIdx][rowIdx, colIdx + 1]]);
            }
        }
    }

    // Output the total count of recorded valid moves.
    console.log(validMoves.length);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
