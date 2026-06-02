function processGridData(inputRawString) {
    const inputLines = inputRawString.split("\n");

    const firstLineValues = inputLines[0].split(" ").map(Number);
    const gridSize = firstLineValues[0];
    const numColors = firstLineValues[1];

    const colorChangeCostMatrix = [];
    for (let rowIdx = 0; rowIdx < numColors; rowIdx++) {
        colorChangeCostMatrix.push(inputLines[rowIdx + 1].split(" ").map(Number));
    }

    const originalGridValues = [];
    const gridDataStartLine = 1 + numColors;
    for (let rowIdx = 0; rowIdx < gridSize; rowIdx++) {
        originalGridValues.push(inputLines[gridDataStartLine + rowIdx].split(" ").map(val => Number(val) - 1));
    }

    const colorGroupCounts = Array.from({ length: 3 }, () => Array(numColors).fill(0));
    const MODULO_DIVISOR = 3;

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const currentGroupIdentifier = (r + c) % MODULO_DIVISOR;
            const originalColorIndex = originalGridValues[r][c];
            colorGroupCounts[currentGroupIdentifier][originalColorIndex]++;
        }
    }

    let minimumOverallCost = Infinity;

    const calculateCombinationCost = (assignedColorForGroup0, assignedColorForGroup1, assignedColorForGroup2) => {
        let currentCombinationCost = 0;
        for (let originalColor = 0; originalColor < numColors; originalColor++) {
            currentCombinationCost += colorGroupCounts[0][originalColor] * colorChangeCostMatrix[originalColor][assignedColorForGroup0];
            currentCombinationCost += colorGroupCounts[1][originalColor] * colorChangeCostMatrix[originalColor][assignedColorForGroup1];
            currentCombinationCost += colorGroupCounts[2][originalColor] * colorChangeCostMatrix[originalColor][assignedColorForGroup2];
        }
        return currentCombinationCost;
    };

    for (let assignedColorForGroup0 = 0; assignedColorForGroup0 < numColors; assignedColorForGroup0++) {
        for (let assignedColorForGroup1 = 0; assignedColorForGroup1 < numColors; assignedColorForGroup1++) {
            if (assignedColorForGroup0 === assignedColorForGroup1) {
                continue;
            }
            for (let assignedColorForGroup2 = 0; assignedColorForGroup2 < numColors; assignedColorForGroup2++) {
                if (assignedColorForGroup0 === assignedColorForGroup2 || assignedColorForGroup1 === assignedColorForGroup2) {
                    continue;
                }

                const currentCombinationTotalCost = calculateCombinationCost(
                    assignedColorForGroup0,
                    assignedColorForGroup1,
                    assignedColorForGroup2
                );

                minimumOverallCost = Math.min(minimumOverallCost, currentCombinationTotalCost);
            }
        }
    }

    console.log(minimumOverallCost);
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
