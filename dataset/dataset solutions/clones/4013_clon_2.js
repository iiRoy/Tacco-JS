// This function orchestrates the entire data processing workflow.
function ProcessInputData(rawInputText) {
    // Split the entire input string into an array of lines.
    rawInputText = rawInputText.split('\n');

    // Parse the first line to get grid dimensions and step size.
    const initialConfig = rawInputText[0].split(' ').map(item => Number.parseInt(item, 10));
    let gridColumns = initialConfig[1];    // Store the width.
    let stepMagnitude = initialConfig[2];  // Store the "D" value, representing the jump distance.
    let gridRows = initialConfig[0];       // Store the height.

    // Initialize a structure to hold the (row, col) coordinates for each number.
    // The size is (rows * cols + 1) because numbers are 1-indexed.
    // Each entry will be a 2-element array [row, col].
    const valueCoordinates = Array.from({ length: gridRows * gridColumns + 1 }, () => new Array(2).fill(0));

    // Iterate through the grid input lines to populate the coordinate map.
    for (let rowIterator = 0; rowIterator < gridRows; ++rowIterator) {
        // Parse the current line of grid values.
        const currentGridLine = rawInputText[rowIterator + 1].split(' ').map(item => Number.parseInt(item, 10));
        
        // For each number in the current line, record its position within the grid.
        for (let columnIterator = 0; columnIterator < gridColumns; ++columnIterator) {
            const currentNumber = currentGridLine[columnIterator];
            valueCoordinates[currentNumber][0] = rowIterator;    // Store row index (Y-coordinate).
            valueCoordinates[currentNumber][1] = columnIterator; // Store column index (X-coordinate).
        }
    }

    // Determine the total number of queries from the line immediately following the grid data.
    const numberOfQueries = Number.parseInt(rawInputText[gridRows + 1], 10);
    // Prepare an array to store the computed results for each query, initialized to zero.
    let finalOutcomes = new Array(numberOfQueries).fill(0);

    // Process each query one by one to calculate the total path cost.
    for (let queryIndex = 0; queryIndex < numberOfQueries; ++queryIndex) {
        // Parse the current query's start and end values from its respective line.
        const queryBounds = rawInputText[gridRows + 2 + queryIndex].split(' ').map(item => Number.parseInt(item, 10));
        let upperBound = queryBounds[1]; // The target value for the query path.
        let lowerBound = queryBounds[0]; // The starting value for the query path.

        // Calculate the "Manhattan distance" for the path by repeatedly jumping.
        // This loop continues until the current lowerBound reaches the upperBound.
        while (lowerBound !== upperBound) {
            // Retrieve coordinates for the current number and the number 'stepMagnitude' steps away.
            const [x1, y1] = valueCoordinates[lowerBound];
            const [x2, y2] = valueCoordinates[lowerBound + stepMagnitude];
            
            // Add the Manhattan distance between these two points to the current query's total.
            // Manhattan distance = |x1 - x2| + |y1 - y2|.
            finalOutcomes[queryIndex] += Math.abs(x1 - x2) + Math.abs(y1 - y2);
            
            // Advance the lowerBound by the predefined stepMagnitude.
            lowerBound += stepMagnitude;
        }
    }

    // Output all calculated query results, with each result on a new line.
    console.log(finalOutcomes.join('\n'));
}

// Invoke the main processing function with input read from standard input.
// This reads the entire standard input as a UTF-8 string.
ProcessInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));