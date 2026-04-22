const F_SYSTEM = require('node:fs');

let MEM_TABLE;
let TILING_SEQ;
const MODULUS_VAL = 1000000007;

function buildTilingSequence(limitIndex) {
    // This function generates a sequence similar to Fibonacci: f(0)=1, f(1)=1, f(n)=f(n-1)+f(n-2)
    // The sequence is used to count ways to tile a 1xN strip with 1x1 and 1x2 blocks.
    if (limitIndex < 0) return [];
    const sequence = [1]; // Corresponds to v[0] (ways to tile 1x0 strip)
    if (limitIndex === 0) return sequence;
    sequence.push(1); // Corresponds to v[1] (ways to tile 1x1 strip)
    for (let index = 2; index <= limitIndex; ++index) {
        sequence.push((sequence[index - 1] + sequence[index - 2]));
    }
    return sequence;
}

function calculatePathCombinations(currentHeight, currentColumn, totalWidth) {
    if (currentHeight === 0) {
        // Base case: At height 0, only column 1 has 1 way, others 0.
        return currentColumn === 1 ? 1 : 0;
    }
    if (MEM_TABLE[currentHeight][currentColumn] !== -1) {
        // Return memoized result if already computed
        return MEM_TABLE[currentHeight][currentColumn];
    }

    let waysAccumulator = 0;

    if (currentColumn === 1) {
        // Current column is the leftmost (1)
        // Contribution from staying in column 1 from previous row
        waysAccumulator = (waysAccumulator +
                           calculatePathCombinations(currentHeight - 1, 1, totalWidth) *
                           TILING_SEQ[totalWidth - 1]) % MODULUS_VAL;
        // Contribution from moving from column 2 to 1 (implies horizontal block 1-2 in current row)
        // totalWidth is guaranteed to be >= 2 here because of the early exit for totalWidth === 1
        waysAccumulator = (waysAccumulator +
                           calculatePathCombinations(currentHeight - 1, 2, totalWidth) *
                           TILING_SEQ[totalWidth - 2]) % MODULUS_VAL;

    } else if (currentColumn === totalWidth) {
        // Current column is the rightmost (totalWidth)
        // Contribution from moving from column totalWidth-1 to totalWidth
        waysAccumulator = (waysAccumulator +
                           calculatePathCombinations(currentHeight - 1, totalWidth - 1, totalWidth) *
                           TILING_SEQ[totalWidth - 2]) % MODULUS_VAL;
        // Contribution from staying in column totalWidth
        waysAccumulator = (waysAccumulator +
                           calculatePathCombinations(currentHeight - 1, totalWidth, totalWidth) *
                           TILING_SEQ[totalWidth - 1]) % MODULUS_VAL;

    } else {
        // Current column is in the middle (1 < currentColumn < totalWidth)
        // Contribution from moving from currentColumn-1 to currentColumn
        waysAccumulator = (waysAccumulator +
                           calculatePathCombinations(currentHeight - 1, currentColumn - 1, totalWidth) *
                           TILING_SEQ[currentColumn - 2] % MODULUS_VAL *
                           TILING_SEQ[totalWidth - currentColumn] % MODULUS_VAL) % MODULUS_VAL;
        // Contribution from staying in currentColumn
        waysAccumulator = (waysAccumulator +
                           calculatePathCombinations(currentHeight - 1, currentColumn, totalWidth) *
                           TILING_SEQ[currentColumn - 1] % MODULUS_VAL *
                           TILING_SEQ[totalWidth - currentColumn] % MODULUS_VAL) % MODULUS_VAL;
        // Contribution from moving from currentColumn+1 to currentColumn
        waysAccumulator = (waysAccumulator +
                           calculatePathCombinations(currentHeight - 1, currentColumn + 1, totalWidth) *
                           TILING_SEQ[currentColumn - 1] % MODULUS_VAL *
                           TILING_SEQ[totalWidth - currentColumn - 1] % MODULUS_VAL) % MODULUS_VAL;
    }

    MEM_TABLE[currentHeight][currentColumn] = waysAccumulator;
    return waysAccumulator;
}

function solveGridProblem() {
    const inputContent = F_SYSTEM.readFileSync(0, 'utf8'); // Read from stdin file descriptor 0
    const [gridHeight, gridWidth, targetPosition] = inputContent.trim().split(' ').map(Number);

    if (gridWidth === 1) {
        console.log(1); // Special case as per original code
        return;
    }

    // TILING_SEQ needs to provide values up to index (gridWidth - 1)
    // buildTilingSequence(N) generates sequence up to index N.
    TILING_SEQ = buildTilingSequence(gridWidth - 1);

    // Initialize memoization table with -1 to indicate uncomputed states
    MEM_TABLE = Array(gridHeight + 1).fill(null).map(() => Array(gridWidth + 1).fill(-1));

    console.log(calculatePathCombinations(gridHeight, targetPosition, gridWidth));
}

solveGridProblem();