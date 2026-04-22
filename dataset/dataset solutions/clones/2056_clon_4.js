const sumVectors = (vecA, vecB) => vecA.map((val, idx) => val + vecB[idx]);

const calculateColumnSegmentation = (segments, capacityThreshold, totalWidth) => {
    const findOptimalColumnBreaks = (currentColumnIdx, segmentStartColumnIdx, verticalBreaksCount) => {
        if (currentColumnIdx === totalWidth) {
            return verticalBreaksCount;
        }

        let exceedsThreshold = false;
        for (const currentSegment of segments) {
            if (currentSegment[currentColumnIdx + 1] - currentSegment[segmentStartColumnIdx] > capacityThreshold) {
                exceedsThreshold = true;
                break;
            }
        }

        if (exceedsThreshold) {
            if (currentColumnIdx === segmentStartColumnIdx) {
                return Infinity;
            }
            return findOptimalColumnBreaks(currentColumnIdx, currentColumnIdx, verticalBreaksCount + 1);
        } else {
            return findOptimalColumnBreaks(currentColumnIdx + 1, segmentStartColumnIdx, verticalBreaksCount);
        }
    };

    return findOptimalColumnBreaks(0, 0, 0);
};

const exploreHorizontalDivisions = (
    currentGridRowIdx,
    currentMergedSections,
    horizontalBreaksMade,
    totalRows,
    totalCols,
    maxCapacity,
    fullPrefixSumGrid
) => {
    if (currentGridRowIdx === totalRows) {
        const requiredVerticalBreaks = calculateColumnSegmentation(currentMergedSections, maxCapacity, totalCols);
        if (requiredVerticalBreaks === Infinity) {
            return Infinity;
        }
        return horizontalBreaksMade + requiredVerticalBreaks;
    }

    let overallMinimumBreaks = Infinity;

    // Option 1: Do NOT make a horizontal cut
    const mergedSectionsNoCut = currentMergedSections.map(arr => arr.slice());
    const lastSectionIndex = mergedSectionsNoCut.length - 1;
    mergedSectionsNoCut[lastSectionIndex] = sumVectors(
        mergedSectionsNoCut[lastSectionIndex],
        fullPrefixSumGrid[currentGridRowIdx]
    );

    overallMinimumBreaks = Math.min(
        overallMinimumBreaks,
        exploreHorizontalDivisions(
            currentGridRowIdx + 1,
            mergedSectionsNoCut,
            horizontalBreaksMade,
            totalRows,
            totalCols,
            maxCapacity,
            fullPrefixSumGrid
        )
    );

    // Option 2: MAKE a horizontal cut
    const mergedSectionsWithCut = [
        ...currentMergedSections,
        fullPrefixSumGrid[currentGridRowIdx].slice()
    ];

    overallMinimumBreaks = Math.min(
        overallMinimumBreaks,
        exploreHorizontalDivisions(
            currentGridRowIdx + 1,
            mergedSectionsWithCut,
            horizontalBreaksMade + 1,
            totalRows,
            totalCols,
            maxCapacity,
            fullPrefixSumGrid
        )
    );

    return overallMinimumBreaks;
};

const processChocolateBar = (rawData) => {
    const dataLines = rawData.trim().split('\n').filter(line => line.length > 0);

    const [headerLine, ...gridContentLines] = dataLines;
    const [numRows, numCols, maxAllowedCapacity] = headerLine.split(' ').map(Number);

    const initialBinaryGrid = gridContentLines.map(rowString =>
        rowString.split('').map(Number)
    );

    const cumulativeRowSums = initialBinaryGrid.map(row => {
        let runningSum = 0;
        const sumsArray = [0];
        for (const cellValue of row) {
            runningSum += cellValue;
            sumsArray.push(runningSum);
        }
        return sumsArray;
    });

    if (numRows === 0) {
        return 0;
    }
    if (numRows === 1) {
        return calculateColumnSegmentation([cumulativeRowSums[0]], maxAllowedCapacity, numCols);
    }

    const finalMinimumCuts = exploreHorizontalDivisions(
        1,
        [cumulativeRowSums[0]],
        0,
        numRows,
        numCols,
        maxAllowedCapacity,
        cumulativeRowSums
    );

    return finalMinimumCuts;
};

// Example usage (assuming input is read from /dev/stdin in a competitive programming environment):
// console.log(processChocolateBar(require("fs").readFileSync("/dev/stdin", "utf8")));