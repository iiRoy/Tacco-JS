function solveGridChallenge() {
    const gridConfig = nextIntArray(); // Reads [H, W]
    const rowCount = gridConfig[0];
    const colCount = gridConfig[1];

    const patternData = [];
    for (let k = 0; k < rowCount; k++) {
        patternData.push(nextCharArray());
    }

    // Step 1: Helper to transpose a matrix
    const mirrorField = (inputMatrix) => {
        const numRows = inputMatrix.length;
        if (numRows === 0) return [];
        const numCols = inputMatrix[0].length;
        const mirrored = Array.from({ length: numCols }, () => Array(numRows).fill(null));
        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < numCols; c++) {
                mirrored[c][r] = inputMatrix[r][c];
            }
        }
        return mirrored;
    };

    // Step 2: Calculate horizontal run lengths ending at current cell
    // Uses functional map approach for rows
    const horizontalSegments = patternData.map(line => {
        let currentCount = 0;
        return line.map(symbol => {
            currentCount = (symbol === '.') ? (currentCount + 1) : 0;
            return currentCount;
        });
    });

    // Step 3: Calculate vertical run lengths ending at current cell
    // Achieved by transposing, applying horizontal logic, then transposing back
    const transposedPattern = mirrorField(patternData);
    const verticalSegmentsTransposed = transposedPattern.map(line => {
        let currentCount = 0;
        return line.map(symbol => {
            currentCount = (symbol === '.') ? (currentCount + 1) : 0;
            return currentCount;
        });
    });
    const verticalSegments = mirrorField(verticalSegmentsTransposed);

    // Step 4: Calculate horizontal maximum suffix runs
    // For each cell (r, c), find max horizontal run length ending at (r, k) where k >= c
    const horizMaxSuffix = Array.from({ length: rowCount }, () => Array(colCount).fill(0));
    for (let r_idx = 0; r_idx < rowCount; r_idx++) {
        for (let c_idx = colCount - 1; c_idx >= 0; c_idx--) {
            if (patternData[r_idx][c_idx] === '.') {
                const rightNeighborMax = (c_idx < colCount - 1) ? horizMaxSuffix[r_idx][c_idx + 1] : 0;
                horizMaxSuffix[r_idx][c_idx] = Math.max(horizontalSegments[r_idx][c_idx], rightNeighborMax);
            } else {
                horizMaxSuffix[r_idx][c_idx] = 0;
            }
        }
    }

    // Step 5: Calculate vertical maximum suffix runs
    // For each cell (r, c), find max vertical run length ending at (k, c) where k >= r
    // Achieved by transposing verticalSegments, applying horizontal max suffix logic, then transposing back
    const transposedVertSegments = mirrorField(verticalSegments);
    const transposedPatternForVerticalSuffix = mirrorField(patternData); // Need original pattern data transposed

    const vertMaxSuffixTransposed = Array.from({ length: colCount }, () => Array(rowCount).fill(0));
    for (let c_idx = 0; c_idx < colCount; c_idx++) {
        for (let r_idx = rowCount - 1; r_idx >= 0; r_idx--) {
            if (transposedPatternForVerticalSuffix[c_idx][r_idx] === '.') {
                const downNeighborMax = (r_idx < rowCount - 1) ? vertMaxSuffixTransposed[c_idx][r_idx + 1] : 0;
                vertMaxSuffixTransposed[c_idx][r_idx] = Math.max(transposedVertSegments[c_idx][r_idx], downNeighborMax);
            } else {
                vertMaxSuffixTransposed[c_idx][r_idx] = 0;
            }
        }
    }
    const vertMaxSuffix = mirrorField(vertMaxSuffixTransposed);

    // Step 6: Determine the ultimate highest score
    let ultimateMax = 0;
    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
            const currentCellScore = horizMaxSuffix[r][c] + vertMaxSuffix[r][c] - 1;
            ultimateMax = Math.max(ultimateMax, currentCellScore);
        }
    }
    myout(ultimateMax);
}

// The following lines are part of the boilerplate, but the user requested only the raw Main function equivalent.
// To integrate, the original `Main()` call in `read.on('close')` should be replaced with `solveGridChallenge()`.
// For example:
// read.on('close', function(){
//   obj = init(inLine);
//   myerr("-----start-----");
//   var start = new Date();
//   solveGridChallenge(); // Call the new function here
//   var end = new Date() - start;
//   myerr("----- end -----");
//   myerr("time : " + (end) + "ms");
//   myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
// });