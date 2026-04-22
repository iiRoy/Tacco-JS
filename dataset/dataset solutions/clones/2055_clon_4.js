const parseGridMetaData = (firstLine) => {
    const [rowsStr, colsStr, thresholdStr] = firstLine.split(" ");
    return {
        dimensionRows: Number(rowsStr),
        dimensionCols: Number(colsStr),
        densityThreshold: Number(thresholdStr)
    };
};

const generateHorizontalCutPatterns = (numberOfPotentialCuts) => {
    const configurations = [];
    for (let i = 0; i < (1 << numberOfPotentialCuts); i++) {
        const binaryRepresentation = i.toString(2).padStart(numberOfPotentialCuts, '0');
        const countOfCuts = (binaryRepresentation.match(/1/g) || []).length;
        configurations.push({
            numHorizontalCuts: countOfCuts,
            cutPattern: binaryRepresentation
        });
    }
    return configurations.sort((a, b) => a.numHorizontalCuts - b.numHorizontalCuts);
};

const calculateVerticalCutsForHorizontalConfig = (
    gridDataContent,
    currentHorizontalConfig,
    densityThreshold,
    totalRows
) => {
    let totalCutsForScheme = currentHorizontalConfig.numHorizontalCuts;
    const totalCols = gridDataContent[0].length;
    let currentSegmentOnesCounts = Array(currentHorizontalConfig.numHorizontalCuts + 1).fill(0);
    
    for (let colIdx = 0; colIdx < totalCols; colIdx++) {
        let onesInCurrentColumnPerStrip = Array(currentHorizontalConfig.numHorizontalCuts + 1).fill(0);
        let currentStripIndex = 0;

        for (let rowIdx = 0; rowIdx < totalRows; rowIdx++) {
            if (gridDataContent[rowIdx][colIdx] === '1') {
                onesInCurrentColumnPerStrip[currentStripIndex]++;
            }
            if (currentHorizontalConfig.cutPattern[rowIdx] === '1') {
                currentStripIndex++;
            }
        }

        const projectedOnesCounts = currentSegmentOnesCounts.map((currentVal, idx) => currentVal + onesInCurrentColumnPerStrip[idx]);
        const segmentWouldExceedThreshold = projectedOnesCounts.some(count => count > densityThreshold);

        if (segmentWouldExceedThreshold) {
            if (onesInCurrentColumnPerStrip.some(count => count > densityThreshold)) {
                return Infinity;
            }

            totalCutsForScheme++;
            currentSegmentOnesCounts = [...onesInCurrentColumnPerStrip];
        } else {
            currentSegmentOnesCounts = projectedOnesCounts;
        }
    }
    return totalCutsForScheme;
};

const executeGridPartitioning = (rawInputData) => {
    const inputLines = rawInputData.trim().split('\n');
    const { dimensionRows, dimensionCols, densityThreshold } = parseGridMetaData(inputLines[0]);
    const gridContent = inputLines.slice(1);

    let minimumAchievedCuts = dimensionRows * dimensionCols;

    const allHorizontalConfigurations = generateHorizontalCutPatterns(dimensionRows - 1);

    for (const config of allHorizontalConfigurations) {
        const cutsForThisConfig = calculateVerticalCutsForHorizontalConfig(
            gridContent,
            config,
            densityThreshold,
            dimensionRows
        );
        minimumAchievedCuts = Math.min(minimumAchievedCuts, cutsForThisConfig);
    }
    return minimumAchievedCuts;
};

const processedResult = executeGridPartitioning(require("fs").readFileSync("/dev/stdin", "utf8"));
console.log(processedResult);