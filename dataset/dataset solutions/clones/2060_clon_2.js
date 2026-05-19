'use strict';

const entryPoint = (inputData) => {

    // Utility function to generate binary strings within a specified range.
    // It ensures that generated strings have a consistent count of '1' bits
    // as determined by the starting binary string.
    const generateBinaryStrings = (startBinStr, endBinStr) => {
        // Calculate the required number of '1's from the minimum binary string.
        const requiredOneCount = (startBinStr.match(/1/g) || []).length;
        let startInteger = parseInt(startBinStr, 2);
        let endInteger = parseInt(endBinStr, 2);
        const generatedBinaries = [];

        // Iterate through all integers from start to end.
        for (let currentInt = startInteger; currentInt <= endInteger; ++currentInt) {
            const currentBinString = (currentInt).toString(2);

            // Skip if the current binary string does not have the required '1' count.
            if (requiredOneCount !== (currentBinString.match(/1/g) || []).length) {
                continue;
            }

            // Pad the binary string with leading zeros to match the maximum length.
            const leadingZeros = Array.from({ length: endBinStr.length - currentBinString.length }).map(() => '0').join('');
            generatedBinaries.push(leadingZeros + currentBinString);
        }

        return generatedBinaries;
    };

    // Parse the raw input data.
    const rawInputLines = inputData.trim().split('\n');
    // The first line contains the grid dimensions: [height, width].
    const gridDimensions = rawInputLines[0].split(' ').map(item => parseInt(item, 10));
    const mapHeight = gridDimensions[0];
    const mapWidth = gridDimensions[1];

    // Construct the initial grid map.
    // '.' (path) is represented as 1, '#' (wall) is represented as 0.
    const initialGridMap = rawInputLines.slice(1).filter((_line, lineIdx) => lineIdx < mapHeight).map((mapRowString) => {
        return mapRowString.split('').filter((_char, charIdx) => charIdx < mapWidth).map(mapChar => mapChar === '.' ? 0x1 : 0x0);
    });

    let minimumObstacleHits; // This variable will store the minimum number of obstacles encountered.
    const finalRowIndex = mapHeight - 0x1;
    const finalColIndex = mapWidth - 0x1;

    // Define the binary patterns for paths.
    // '0' represents a move to the right (increment X), '1' represents a move down (increment Y).
    // A path from (0,0) to (finalColIndex, finalRowIndex) will always consist of
    // finalColIndex '0's and finalRowIndex '1's.
    const minPathBinaryPattern = Array.from({ length: finalColIndex }).map(() => '0').join('') + Array.from({ length: finalRowIndex }).map(() => '1').join('');
    const maxPathBinaryPattern = Array.from({ length: finalRowIndex }).map(() => '1').join('') + Array.from({ length: finalColIndex }).map(() => '0').join('');

    // Generate all possible valid path patterns.
    const allValidPathPatterns = generateBinaryStrings(minPathBinaryPattern, maxPathBinaryPattern);

    // Evaluate each generated path pattern.
    allValidPathPatterns.forEach((pathPatternString) => {
        const currentPathSteps = pathPatternString.split('');

        let currentObstacleCount = 0;
        let currentXPosition = 0;
        let currentYPosition = 0;

        // Check the starting cell for an obstacle.
        if (initialGridMap[currentYPosition][currentXPosition] === 0x0) {
            currentObstacleCount++;
        }

        // Traverse the path according to the current pattern.
        currentPathSteps.forEach(nextMove => {
            if (nextMove === '1') { // Move down
                currentYPosition++;
            } else { // Move right
                currentXPosition++;
            }
            // Check the current cell for an obstacle after moving.
            if (initialGridMap[currentYPosition][currentXPosition] === 0x0) {
                currentObstacleCount++;
            }
        });

        // Update the overall minimum obstacle count if this path is better.
        if (minimumObstacleHits === undefined || minimumObstacleHits > currentObstacleCount) {
            minimumObstacleHits = currentObstacleCount;
        }
    });

    // Output the calculated minimum number of obstacles.
    console.log(minimumObstacleHits);
};

// Read input from standard input and execute the main logic.
entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
