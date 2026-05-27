function ProcessInput(rawData) {
    // Split the entire input string into an array of individual lines.
    const lines = rawData.split("\n");

    // The first line contains grid height (H), grid width (W), and step distance (D).
    // Parse these values from the first line.
    const dimensions = lines[0].split(" ").map(valueStr => parseInt(valueStr, 10));
    const gridHeight = dimensions[0]; // Original 'H'
    const gridWidth = dimensions[1];  // Original 'W'
    const stepDistance = dimensions[2]; // Original 'D'

    // Create a map to store the [row, column] coordinates for each number.
    // Numbers range from 1 to (gridHeight * gridWidth).
    // The array is indexed by the number itself.
    // Each element will be an array of two integers: [row_index, column_index].
    const coordinatesMap = new Array(gridHeight * gridWidth + 1).fill(0).map(() => new Array(2));

    // Populate the coordinates map by reading the grid layout.
    // Iterate through each row of the input grid.
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        // Parse the numbers in the current row.
        const currentRowValues = lines[rowIdx + 1].split(" ").map(valueStr => parseInt(valueStr, 10));

        // Iterate through each column in the current row.
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            // Get the number at the current grid position.
            const currentNumber = currentRowValues[colIdx];
            // Store its row and column indices in the map.
            coordinatesMap[currentNumber][0] = rowIdx;
            coordinatesMap[currentNumber][1] = colIdx;
        }
    }

    // Read the number of queries from the input.
    const numQueries = parseInt(lines[gridHeight + 1], 10);
    // Initialize an array to store the calculated total distances for each query.
    const resultsArray = new Array(numQueries).fill(0);

    // Process each query to calculate the total Manhattan distance.
    for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
        // Each query line contains a starting number (L) and an ending number (R).
        const queryBounds = lines[gridHeight + 2 + queryIdx].split(" ").map(valueStr => parseInt(valueStr, 10));
        let startValue = queryBounds[0]; // Original 'L'
        const endValue = queryBounds[1];   // Original 'R'

        // Traverse the path from startValue to endValue, adding 'stepDistance' at each step.
        // Calculate the Manhattan distance for each segment of the path.
        while (startValue !== endValue) {
            // Get the coordinates of the current number.
            const currentNumRow = coordinatesMap[startValue][0];
            const currentNumCol = coordinatesMap[startValue][1];

            // Get the coordinates of the next number in the sequence (startValue + stepDistance).
            const nextNumRow = coordinatesMap[startValue + stepDistance][0];
            const nextNumCol = coordinatesMap[startValue + stepDistance][1];

            // Calculate the Manhattan distance between the current and next number.
            // Add this distance to the total for the current query.
            resultsArray[queryIdx] += Math.abs(currentNumRow - nextNumRow) + Math.abs(currentNumCol - nextNumCol);

            // Move to the next number in the path.
            startValue += stepDistance;
        }
    }

    // Output all calculated results, each on a new line.
    console.log(resultsArray.join("\n"));
}

// Entry point: Read input from standard input and invoke the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
