const parseRawData = (inputTxt) => {
    const rawLines = inputTxt.split('\n');
    const [gridHeight, gridWidth] = rawLines[0].split(' ').map(Number);

    const occupiedCells = new Set(); // Stores coordinates of '#' cells as strings "row,col"

    // Process grid lines, excluding the first (dimensions) and potentially last (empty string from trailing newline)
    rawLines.slice(1, -1).forEach((lineContents, rIndex) => {
        lineContents.split('').forEach((character, cIndex) => {
            if (character === '#') {
                occupiedCells.add(`${rIndex},${cIndex}`);
            }
        });
    });

    return { gridHeight, gridWidth, occupiedCells };
};

const checkAdjacentActivity = (pointKey, allOccupiedCells, maxRows, maxCols, displacementVectors) => {
    const [currentRow, currentCol] = pointKey.split(',').map(Number);

    // Use Array.prototype.some to find if at least one neighbor satisfies the condition
    return displacementVectors.some(([deltaR, deltaC]) => {
        const nextRow = currentRow + deltaR;
        const nextCol = currentCol + deltaC;

        const isWithinBoundaries = nextRow >= 0 && nextRow < maxRows && nextCol >= 0 && nextCol < maxCols;
        const isNeighborOccupied = allOccupiedCells.has(`${nextRow},${nextCol}`);

        return isWithinBoundaries && isNeighborOccupied;
    });
};

const evaluateConnectivity = (gridData) => {
    const { gridHeight, gridWidth, occupiedCells } = gridData;

    // Define the four cardinal directions (up, right, down, left)
    const displacementVectors = [
        [-1, 0], // North
        [0, 1],  // East
        [1, 0],  // South
        [0, -1]  // West
    ];

    // If there are no '#' cells, the condition is trivially met.
    if (occupiedCells.size === 0) {
        return 'Yes';
    }

    // Convert the Set to an Array to use Array.prototype.every
    // Check if every '#' cell has at least one '#' neighbor
    const allConnected = Array.from(occupiedCells).every(currentCellKey =>
        checkAdjacentActivity(currentCellKey, occupiedCells, gridHeight, gridWidth, displacementVectors)
    );

    return allConnected ? 'Yes' : 'No';
};

const executeGridValidation = (sourceData) => {
    const processedInformation = parseRawData(sourceData);
    const finalOutcome = evaluateConnectivity(processedInformation);
    console.log(finalOutcome);
};

executeGridValidation(require("fs").readFileSync("/dev/stdin", "utf8"));