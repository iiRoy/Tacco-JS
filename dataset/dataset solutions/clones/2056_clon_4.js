const combinePrefixArrays = (firstVector, secondVector) => firstVector.map((value, index) => value + secondVector[index]);

function* generateHorizontalPartitions(totalRows, allRowPrefixSums) {
    const potentialCutPoints = totalRows - 1;
    const totalConfigurations = 1 << potentialCutPoints;

    for (let partitionIndex = 0; partitionIndex < totalConfigurations; partitionIndex++) {
        let currentHorizontalCutCount = 0;
        const currentCombinedSegments = [];
        
        currentCombinedSegments.push(allRowPrefixSums[0].slice());

        for (let divisionBitIndex = 0; divisionBitIndex < potentialCutPoints; divisionBitIndex++) {
            if ((partitionIndex >> divisionBitIndex) & 1) {
                currentHorizontalCutCount++;
                currentCombinedSegments.push(allRowPrefixSums[divisionBitIndex + 1].slice());
            } else {
                const lastSegmentIndex = currentCombinedSegments.length - 1;
                currentCombinedSegments[lastSegmentIndex] = combinePrefixArrays(
                    currentCombinedSegments[lastSegmentIndex],
                    allRowPrefixSums[divisionBitIndex + 1]
                );
            }
        }
        yield { mergedSegments: currentCombinedSegments, horizontalCuts: currentHorizontalCutCount };
    }
}

function determineVerticalCuts(segmentPrefixSums, maxAllowedSum, totalColumns) {
    let currentColumnPosition = 1;
    let verticalCutCount = 0;
    
    const segmentStartValues = Array(segmentPrefixSums.length).fill(0);

    while (currentColumnPosition <= totalColumns) {
        let requiresCut = false;
        for (let segmentIndex = 0; segmentIndex < segmentPrefixSums.length; segmentIndex++) {
            const currentSegmentSum = segmentPrefixSums[segmentIndex][currentColumnPosition] - segmentStartValues[segmentIndex];
            if (currentSegmentSum > maxAllowedSum) {
                requiresCut = true;
                break;
            }
        }

        if (requiresCut) {
            if (currentColumnPosition === 1) {
                return null;
            }
            verticalCutCount++;
            for (let segmentIndex = 0; segmentIndex < segmentPrefixSums.length; segmentIndex++) {
                segmentStartValues[segmentIndex] = segmentPrefixSums[segmentIndex][currentColumnPosition - 1];
            }
        } else {
            currentColumnPosition++;
        }
    }
    return verticalCutCount;
}

function ProcessGridData(rawInputString) {
    const inputLines = rawInputString.trim().split("\n").map(line => line.split(" "));
    const [gridHeight, gridWidth, maxAllowedSum] = inputLines[0].map(Number);

    const gridValues = []; 
    const rowCumulativeSums = [];

    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        const currentRowData = inputLines[rowIndex + 1][0].split("").map(Number);
        gridValues.push(currentRowData);
        
        const currentCumulativeRow = [0];
        let runningSumForCurrentRow = 0;
        for (let columnIndex = 0; columnIndex < gridWidth; columnIndex++) {
            runningSumForCurrentRow += currentRowData[columnIndex];
            currentCumulativeRow.push(runningSumForCurrentRow);
        }
        rowCumulativeSums.push(currentCumulativeRow);
    }
    return { gridHeight, gridWidth, maxAllowedSum, rowCumulativeSums };
}

function SolveProblem(inputString) {
    const { gridHeight, gridWidth, maxAllowedSum, rowCumulativeSums } = ProcessGridData(inputString);

    let minimumTotalCuts = (gridHeight - 1) + (gridWidth - 1);

    for (const partitionResult of generateHorizontalPartitions(gridHeight, rowCumulativeSums)) {
        const { mergedSegments, horizontalCuts } = partitionResult;
        
        const verticalCuts = determineVerticalCuts(mergedSegments, maxAllowedSum, gridWidth);

        if (verticalCuts !== null) {
            minimumTotalCuts = Math.min(minimumTotalCuts, horizontalCuts + verticalCuts);
        }
    }
    console.log(minimumTotalCuts);
}

SolveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
