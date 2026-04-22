const processGridAnalysis = (rawMatrixData) => {
    // Deconstruct raw input into structural components
    const inputLines = rawMatrixData.trim().split('\n');
    const [totalRows, totalCols] = inputLines[0].split(' ').map(Number);
    const initialSurface = inputLines.slice(1).map(rowString => rowString.split(''));

    // Utility to determine hazard proximity for a given location
    const quantifyNeighboringHazards = (currentY, currentX, terrainMap) => {
        let detectedHazards = 0;
        // Relative coordinates for all eight surrounding positions
        const proximityVectors = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        // Examine each adjacent location
        proximityVectors.forEach(([deltaY, deltaX]) => {
            const neighborY = currentY + deltaY;
            const neighborX = currentX + deltaX;

            // Confirm neighbor is within the valid boundaries of the terrain
            if (neighborY >= 0 && neighborY < totalRows &&
                neighborX >= 0 && neighborX < totalCols) {
                // If the neighboring spot contains a hazard marker ('#'), increment the count
                if (terrainMap[neighborY][neighborX] === '#') {
                    detectedHazards++;
                }
            }
        });
        return detectedHazards;
    };

    // Construct the final grid by applying the hazard analysis
    const generateFinalGrid = (heightExtent, widthExtent, sourceTerrain) => {
        const resultingStructure = [];
        for (let y = 0; y < heightExtent; y++) {
            const currentOutputRow = [];
            for (let x = 0; x < widthExtent; x++) {
                const currentCellSymbol = sourceTerrain[y][x];
                if (currentCellSymbol === '#') {
                    currentOutputRow.push('#'); // Hazards remain unchanged
                } else if (currentCellSymbol === '.') {
                    // Empty cells are replaced by the count of adjacent hazards
                    currentOutputRow.push(quantifyNeighboringHazards(y, x, sourceTerrain));
                } else {
                    // Retain other symbols if they exist (though not expected in this problem type)
                    currentOutputRow.push(currentCellSymbol);
                }
            }
            resultingStructure.push(currentOutputRow);
        }
        return resultingStructure;
    };

    // Execute the grid transformation
    const analyzedGrid = generateFinalGrid(totalRows, totalCols, initialSurface);

    // Format the output: join elements in each row, then join rows with newlines
    const outputSegments = analyzedGrid.map(rowArray => rowArray.join(''));
    console.log(outputSegments.join('\n'));
};

// Initiate the analysis process by reading from standard input
processGridAnalysis(require("fs").readFileSync("/dev/stdin", "utf8").trim());