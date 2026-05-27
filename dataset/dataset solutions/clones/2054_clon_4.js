function processInput(inputLines) {
    const [heightStr, widthStr, maxOnesPerSegmentStr] = inputLines[0].split(" ");
    const height = Number(heightStr);
    const width = Number(widthStr);
    const maxOnesPerSegment = Number(maxOnesPerSegmentStr);

    const gridData = inputLines.slice(1, height + 1).map(row => row.split(''));

    let overallMinimumCuts = height * width; // Initialize with a value guaranteed to be higher than any valid answer

    // Iterate through all possible horizontal cut configurations.
    // There are (height - 1) possible horizontal cut positions.
    // A bitmask of length (height - 1) represents these cuts.
    const maxHorizontalMaskValue = 1 << (height - 1); // 2^(height-1)

    const horizontalConfigurations = [];
    for (let maskValue = 0; maskValue < maxHorizontalMaskValue; maskValue++) {
        horizontalConfigurations.push({
            bitmask: maskValue,
            cutCount: countSetBits(maskValue)
        });
    }

    // Sorting by cut count is an optimization, not strictly required for correctness.
    horizontalConfigurations.sort((a, b) => a.cutCount - b.cutCount);

    for (const config of horizontalConfigurations) {
        const currentHorizontalCutCount = config.cutCount;
        const horizontalCutMask = config.bitmask;

        // Calculate the number of vertical cuts needed for this horizontal configuration.
        // Returns Infinity if the configuration is impossible.
        const verticalCutsRequired = determineVerticalCuts(gridData, height, width, maxOnesPerSegment, horizontalCutMask);

        if (verticalCutsRequired !== Infinity) {
            overallMinimumCuts = Math.min(overallMinimumCuts, currentHorizontalCutCount + verticalCutsRequired);
        }
    }

    console.log(overallMinimumCuts);
}

// Counts the number of set bits (1s) in a 32-bit integer.
function countSetBits(value) {
    let count = 0;
    while (value > 0) {
        value &= (value - 1); // Clears the least significant set bit
        count++;
    }
    return count;
}

// Determines the number of vertical cuts needed for a given horizontal cut configuration.
// Returns Infinity if the configuration is impossible to satisfy.
function determineVerticalCuts(grid, H, W, K, hCutMask) {
    let totalVerticalCuts = 0;

    // Pre-calculate row segments based on the horizontal cut mask.
    // Each segment is defined by [startRowIndex, endRowIndex].
    const rowSegments = [];
    let currentSegmentStartRow = 0;
    for (let r = 0; r < H - 1; r++) {
        // If the r-th bit is set, there's a horizontal cut after row r.
        if ((hCutMask >> r) & 1) {
            rowSegments.push([currentSegmentStartRow, r]);
            currentSegmentStartRow = r + 1;
        }
    }
    rowSegments.push([currentSegmentStartRow, H - 1]); // Add the last segment

    // `currentSegmentOnes` stores the count of '1's in each segment, accumulated since the last vertical cut.
    let currentSegmentOnes = Array(rowSegments.length).fill(0);

    // Iterate through each column.
    for (let colIndex = 0; colIndex < W; colIndex++) {
        let columnRequiresVerticalCut = false;
        // `columnOnesContribution` stores the count of '1's in *only the current column* for each segment.
        let columnOnesContribution = Array(rowSegments.length).fill(0);

        // Calculate '1's for each segment in the current column.
        for (let segIndex = 0; segIndex < rowSegments.length; segIndex++) {
            const [startRow, endRow] = rowSegments[segIndex];
            for (let r = startRow; r <= endRow; r++) {
                if (grid[r][colIndex] === '1') {
                    columnOnesContribution[segIndex]++;
                }
            }
            // Check if adding this column's '1's to the running total exceeds K.
            if (currentSegmentOnes[segIndex] + columnOnesContribution[segIndex] > K) {
                columnRequiresVerticalCut = true;
                break; // A vertical cut is needed before this column.
            }
        }

        if (columnRequiresVerticalCut) {
            totalVerticalCuts++;
            // Critical check: If a vertical cut was needed, we must ensure that
            // even with this new cut, the current column itself doesn't immediately
            // violate the K-limit for any segment. This corresponds to the original
            // code's `i--` and `nsum=[]` followed by an immediate `return` if it fails again.
            for (let segIndex = 0; segIndex < rowSegments.length; segIndex++) {
                if (columnOnesContribution[segIndex] > K) {
                    return Infinity; // This horizontal configuration is impossible.
                }
            }
            // If not impossible, then `currentSegmentOnes` are reset to `columnOnesContribution`
            // because a vertical cut was made, and this column is now the start of a new segment.
            currentSegmentOnes = [...columnOnesContribution];
        } else {
            // No vertical cut needed for this column, so add its contributions to the running totals.
            for (let segIndex = 0; segIndex < rowSegments.length; segIndex++) {
                currentSegmentOnes[segIndex] += columnOnesContribution[segIndex];
            }
        }
    }

    return totalVerticalCuts;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
