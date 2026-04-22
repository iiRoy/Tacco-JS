'use strict';

const processGridInput = (contentString) => {
    const allLines = contentString.split('\n');
    const headerLine = allLines[0];

    const parsedDimensions = headerLine.split(' ').map(Number);
    const primaryDimension = parsedDimensions[0];
    const secondaryDimension = parsedDimensions[0]; // Replicating the original's behavior where width is always equal to height

    // This directly replicates the original's s.slice(1, -1) behavior.
    // It removes the first line (header) and the last line (which might be an empty string from a trailing newline,
    // or an actual grid row if no trailing newline exists).
    const cellMatrix = allLines.slice(1, -1).map(rowText => rowText.split(''));

    return { primaryDimension, secondaryDimension, cellMatrix };
};

const verifyCellAdjacency = (rowCoord, colCoord, gridContent, totalRows, totalCols) => {
    // If the cell is '.', it doesn't need to have '#' neighbors.
    // It's considered 'valid' by this specific check.
    if (gridContent[rowCoord][colCoord] === '.') {
        return true;
    }

    // Define relative coordinates for 4 immediate neighbors (up, down, left, right)
    const directionOffsets = [
        [-1, 0], // Up
        [1, 0],  // Down
        [0, -1], // Left
        [0, 1]   // Right
    ];

    // Use Array.prototype.some to check if *at least one* neighbor is '#'
    return directionOffsets.some(([deltaRow, deltaCol]) => {
        const neighborRow = rowCoord + deltaRow;
        const neighborCol = colCoord + deltaCol;

        // Check if the neighbor is within grid boundaries
        const isWithinBounds = neighborRow >= 0 && neighborRow < totalRows &&
                               neighborCol >= 0 && neighborCol < totalCols;

        // If within bounds, check if the neighbor's content is '#'
        return isWithinBounds && gridContent[neighborRow][neighborCol] === '#';
    });
};

const analyzeStructureValidity = (sourceData) => {
    const { primaryDimension, secondaryDimension, cellMatrix } = processGridInput(sourceData);

    // Use Array.from and Array.prototype.every to functionally iterate and check all cells.
    // This structure will return false as soon as any cell fails the 'verifyCellAdjacency' check.
    const allComponentsAreSound = Array.from({ length: primaryDimension }, (_, currentR) => {
        return Array.from({ length: secondaryDimension }, (_, currentC) => {
            // This access (cellMatrix[currentR][currentC]) will replicate potential TypeError crashes
            // from the original if cellMatrix is shorter than primaryDimension.
            return verifyCellAdjacency(currentR, currentC, cellMatrix, primaryDimension, secondaryDimension);
        }).every(Boolean); // Ensure all cells in the current row pass the check
    }).every(Boolean);     // Ensure all rows pass the check

    return allComponentsAreSound ? 'Yes' : 'No';
};

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(analyzeStructureValidity(rawInputContent));