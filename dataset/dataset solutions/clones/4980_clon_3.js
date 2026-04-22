process.stdin.resume();
process.stdin.setEncoding('utf8');

let rawInputBuffer = '';
let lineData = [];
let currentLineIndex = 0;

process.stdin.on('data', (inputChunk) => {
    rawInputBuffer += inputChunk;
});

const finalizeInputAndExecute = () => {
    lineData = rawInputBuffer.split('\n').filter(line => line.trim() !== '');
    analyzeGrid();
    process.exit(0);
};

process.stdin.on('end', finalizeInputAndExecute);
process.on('SIGINT', finalizeInputAndExecute);

const getNextLine = () => {
    if (currentLineIndex >= lineData.length) {
        console.error("Error: Attempted to read past end of input data.");
        return null;
    }
    return lineData[currentLineIndex++];
};

/////////////// Above this line is input/output boilerplate ////////////////////

/**
 * Generates a unique string key for a 3x3 subgrid based on its top-left corner coordinates.
 * @param {number} row The row index of the top-left corner.
 * @param {number} col The column index of the top-left corner.
 * @returns {string} A unique identifier for the subgrid.
 */
const generateSubgridKey = (row, col) => `R${row}C${col}`;


/**
 * Main function to analyze the grid and count point occurrences in 3x3 subgrids.
 * This function reads grid dimensions and point coordinates from input,
 * then calculates and prints the frequency of 3x3 subgrids containing 0 to 9 points.
 */
function analyzeGrid() {
    let subgridImpactCounts = new Map();

    const initialParamsLine = getNextLine();
    if (!initialParamsLine) {
        console.error("No initial parameters line found.");
        return;
    }
    const paramTokens = initialParamsLine.split(' ');

    const gridHeight = Number(paramTokens[0]);
    const gridWidth = Number(paramTokens[1]);
    const numPoints = Number(paramTokens[2]);

    if (gridHeight < 3 || gridWidth < 3 || numPoints < 0) {
        console.error("Invalid grid dimensions or number of points provided for 3x3 subgrids.");
        for (let i = 0; i < 10; ++i) {
            console.log("0");
        }
        return;
    }

    for (let pointIdx = 0; pointIdx < numPoints; ++pointIdx) {
        const pointCoordLine = getNextLine();
        if (!pointCoordLine) {
            console.error(`Missing coordinate line for point ${pointIdx + 1}`);
            continue;
        }
        const pointTokens = pointCoordLine.split(' ');

        const pointRow = Number(pointTokens[0]);
        const pointCol = Number(pointTokens[1]);

        const minSubgridRow = Math.max(1, pointRow - 2);
        const maxSubgridRow = Math.min(gridHeight - 2, pointRow);

        const minSubgridCol = Math.max(1, pointCol - 2);
        const maxSubgridCol = Math.min(gridWidth - 2, pointCol);

        for (let subgridRowStart = minSubgridRow; subgridRowStart <= maxSubgridRow; ++subgridRowStart) {
            for (let subgridColStart = minSubgridCol; subgridColStart <= maxSubgridCol; ++subgridColStart) {
                const subgridKey = generateSubgridKey(subgridRowStart, subgridColStart);
                subgridImpactCounts.set(subgridKey, (subgridImpactCounts.get(subgridKey) ?? 0) + 1);
            }
        }
    }

    const pointCountFrequencies = new Array(10).fill(0);

    const totalPossibleSubgrids = (gridHeight - 2) * (gridWidth - 2);
    pointCountFrequencies[0] = totalPossibleSubgrids;

    for (const [subgridKey, pointCount] of subgridImpactCounts.entries()) {
        pointCountFrequencies[0]--;

        if (pointCount >= 1 && pointCount <= 9) {
            pointCountFrequencies[pointCount]++;
        } else if (pointCount > 9) {
            pointCountFrequencies[9]++; // Cap at 9, as per typical problem constraints for 3x3 grids.
        }
    }

    pointCountFrequencies.forEach((frequency) => {
        console.log(`${frequency}`);
    });
}