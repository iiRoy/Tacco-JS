const extractSourceInfo = (rawText) => {
    const lines = rawText.trim().split('\n');
    const [dimensionString, ...gridContentRows] = lines;
    const [heightVal, widthVal, limitVal] = dimensionString.split(' ').map(Number);

    const binaryMatrix = gridContentRows.map(rowText =>
        rowText.split('').map(Number)
    );

    const rowCumulativeSums = binaryMatrix.map(singleRow => {
        let currentTotal = 0;
        const sumsCollection = [0]; // sumsCollection[c] stores sum of elements from index 0 to c-1
        for (let colIndex = 0; colIndex < widthVal; colIndex++) {
            currentTotal += singleRow[colIndex];
            sumsCollection.push(currentTotal);
        }
        return sumsCollection;
    });

    return { height: heightVal, width: widthVal, maxSegmentValue: limitVal, cumulativeData: rowCumulativeSums };
};

const mergePrefixTotals = (firstArr, secondArr) =>
    firstArr.map((value, index) => value + secondArr[index]);

const enumerateHorizontalDivisions = (numRows, currentCutIndices = [], checkRowIndex = 0, allPatterns = []) => {
    if (checkRowIndex === numRows - 1) {
        allPatterns.push(currentCutIndices);
        return;
    }

    // Option 1: Don't make a cut after the current row index
    enumerateHorizontalDivisions(numRows, currentCutIndices, checkRowIndex + 1, allPatterns);

    // Option 2: Make a cut after the current row index
    enumerateHorizontalDivisions(numRows, [...currentCutIndices, checkRowIndex], checkRowIndex + 1, allPatterns);

    return allPatterns;
};

const formRowBands = (numRowsTotal, rowCumulativeData, divisionPoints) => {
    const bandedData = [];
    
    for (let currentRowIndex = 0; currentRowIndex < numRowsTotal; currentRowIndex++) {
        // A new band starts if it's the very first row, or if a cut was made after the previous row
        const shouldStartNewBand = (currentRowIndex === 0) || divisionPoints.includes(currentRowIndex - 1);

        if (shouldStartNewBand) {
            bandedData.push(rowCumulativeData[currentRowIndex].slice()); // Clone the array for the new band
        } else {
            // Otherwise, add this row's data to the last existing band
            const lastBandIndex = bandedData.length - 1;
            bandedData[lastBandIndex] = mergePrefixTotals(bandedData[lastBandIndex], rowCumulativeData[currentRowIndex]);
        }
    }
    return bandedData;
};

const determineVerticalSplits = (bandedTotals, numColumnsTotal, segmentLimit) => {
    let verticalCutCount = 0;
    const lastSplitTotals = bandedTotals.map(() => 0); // Stores cumulative sums up to the last vertical cut for each band
    const splitPointMarkers = []; // Records the column indices where vertical cuts are made

    for (let columnPosition = 1; columnPosition <= numColumnsTotal; columnPosition++) {
        let requiresSplit = false;

        for (let bandPosition = 0; bandPosition < bandedTotals.length; bandPosition++) {
            const segmentAccumulation = bandedTotals[bandPosition][columnPosition] - lastSplitTotals[bandPosition];

            if (segmentAccumulation > segmentLimit) {
                requiresSplit = true;
                // Condition for an impossible configuration:
                // 1. The very first column (index 0) itself exceeds the limit, OR
                // 2. A single-column segment (from the previous cut to the current column) exceeds the limit.
                if (columnPosition === 1 || (splitPointMarkers.length > 0 && splitPointMarkers[splitPointMarkers.length - 1] === columnPosition - 1)) {
                    return Infinity; // This horizontal configuration is invalid
                }
                break; // A vertical split is required for this column, no need to check other bands
            }
        }

        if (requiresSplit) {
            verticalCutCount++;
            splitPointMarkers.push(columnPosition - 1); // A cut is made *before* this column (at index columnPosition - 1)
            // Reset the lastSplitTotals for all bands to the sums up to the new split point
            for (let bandPosition = 0; bandPosition < bandedTotals.length; bandPosition++) {
                lastSplitTotals[bandPosition] = bandedTotals[bandPosition][columnPosition - 1];
            }
            columnPosition--; // Decrement to re-evaluate the current column with the new split (effectively checking the segment *after* the split)
        }
    }
    return verticalCutCount;
};

const processInputForMinDivisions = (inputPayload) => {
    const { height, width, maxSegmentValue, cumulativeData } = extractSourceInfo(inputPayload);

    let minOverallCuts = (height - 1) + (width - 1); // Initialize with a worst-case scenario

    const horizontalDivisionPatterns = enumerateHorizontalDivisions(height);

    for (const currentHoriCutsPattern of horizontalDivisionPatterns) {
        const currentHoriCutCount = currentHoriCutsPattern.length;

        const combinedBandPrefixSums = formRowBands(height, cumulativeData, currentHoriCutsPattern);

        const currentVertCuts = determineVerticalSplits(combinedBandPrefixSums, width, maxSegmentValue);

        if (currentVertCuts !== Infinity) { // If the configuration is valid
            minOverallCuts = Math.min(minOverallCuts, currentHoriCutCount + currentVertCuts);
        }
    }

    console.log(minOverallCuts);
};

processInputForMinDivisions(require("fs").readFileSync("/dev/stdin", "utf8"));