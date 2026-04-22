const fileSystem = require('fs');

const extractMatrix = (sourcePath) => {
    const rawContent = fileSystem.readFileSync(sourcePath, 'utf8');
    const lineStrings = rawContent.trim().split('\n');
    const numericMatrix = [];
    for (const line of lineStrings) {
        const rowNumbers = line.split(',').map(entry => parseInt(entry, 10));
        numericMatrix.push(rowNumbers);
    }
    return numericMatrix;
};

const calculateOptimalPath = (dataMatrix) => {
    const totalRows = dataMatrix.length;
    if (totalRows === 0) {
        return 0;
    }

    const midRowIndex = Math.floor((totalRows - 1) / 2);

    // Initialize a DP table to store maximum sums to reach each cell
    // dpTable[r][c] represents the max sum to reach dataMatrix[r][c]
    const dpTable = Array(totalRows).fill(0).map((_, r) =>
        Array(dataMatrix[r].length).fill(Number.MIN_SAFE_INTEGER)
    );

    // Base case: starting point
    dpTable[0][0] = dataMatrix[0][0];

    // Iterate through the matrix, calculating max path sums for each cell
    for (let r = 1; r < totalRows; r++) {
        for (let c = 0; c < dataMatrix[r].length; c++) {
            const currentCellVal = dataMatrix[r][c];
            let maxFromPreviousLevel = Number.MIN_SAFE_INTEGER;

            // Determine previous cells based on the phase (expanding or contracting)
            if (r - 1 < midRowIndex) { // Expanding phase
                // Can arrive from (r-1, c-1) or (r-1, c)
                const pathFromLeftUp = (c - 1 >= 0) ? dpTable[r - 1][c - 1] : Number.MIN_SAFE_INTEGER;
                const pathFromRightUp = (c < dataMatrix[r - 1].length) ? dpTable[r - 1][c] : Number.MIN_SAFE_INTEGER;
                maxFromPreviousLevel = Math.max(pathFromLeftUp, pathFromRightUp);
            } else { // Contracting phase
                // Can arrive from (r-1, c) or (r-1, c+1)
                const pathFromUp = (c >= 0) ? dpTable[r - 1][c] : Number.MIN_SAFE_INTEGER;
                const pathFromRightUpDiag = (c + 1 < dataMatrix[r - 1].length) ? dpTable[r - 1][c + 1] : Number.MIN_SAFE_INTEGER;
                maxFromPreviousLevel = Math.max(pathFromUp, pathFromRightUpDiag);
            }

            // Update the DP table if a valid path was found
            if (maxFromPreviousLevel !== Number.MIN_SAFE_INTEGER) {
                dpTable[r][c] = currentCellVal + maxFromPreviousLevel;
            }
        }
    }

    // The maximum path sum will be the largest value in the last row of the DP table
    let overallResult = Number.MIN_SAFE_INTEGER;
    for (const val of dpTable[totalRows - 1]) {
        overallResult = Math.max(overallResult, val);
    }

    return overallResult;
};

const processedData = extractMatrix('/dev/stdin');
const finalSum = calculateOptimalPath(processedData);
console.log(finalSum);