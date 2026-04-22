function obtainInputData(rawData) {
    const dataLines = rawData.trim().split("\n");
    const [heightDimension, widthDimension, capacityLimit] = dataLines[0].split(" ").map(Number);
    const valueGrid = dataLines.slice(1, 1 + heightDimension).map(line => line.split("").map(Number));
    return { heightDimension, widthDimension, capacityLimit, valueGrid };
}

function countActiveBits(numericValue) {
    let activeBits = 0;
    while (numericValue > 0) {
        numericValue &= (numericValue - 1);
        activeBits++;
    }
    return activeBits;
}

function createDivisionConfigurations(possibleSeparators) {
    const configurationsList = [];
    for (let i = 0; i < (1 << possibleSeparators); i++) {
        const binaryForm = i.toString(2).padStart(possibleSeparators, '0');
        configurationsList.push({
            divisionCount: countActiveBits(i),
            separatorMap: binaryForm.split('').map(Number)
        });
    }
    return configurationsList.sort((a, b) => a.divisionCount - b.divisionCount);
}

function validateConfiguration(gridMatrix, configMap, thresholdValue, totalRows, totalColumns) {
    const cumulativeSectionTotals = Array(totalRows).fill(0);

    const isPartitionViable = Array(totalColumns).fill(0).every((_, colIndex) => {
        let sectionPointer = 0;
        const columnSectionContributions = Array(totalRows).fill(0);

        for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
            if (gridMatrix[rowIndex][colIndex] === 1) {
                columnSectionContributions[sectionPointer]++;
            }
            if (rowIndex < totalRows - 1 && configMap[rowIndex] === 1) {
                sectionPointer++;
            }
        }

        sectionPointer = 0;
        for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
            cumulativeSectionTotals[sectionPointer] += columnSectionContributions[sectionPointer];
            if (cumulativeSectionTotals[sectionPointer] > thresholdValue) {
                return false;
            }
            if (rowIndex < totalRows - 1 && configMap[rowIndex] === 1) {
                sectionPointer++;
            }
        }
        return true;
    });

    return isPartitionViable;
}

function coordinateSolution(rawInputString) {
    const { heightDimension, widthDimension, capacityLimit, valueGrid } = obtainInputData(rawInputString);

    const horizontalSeparationPoints = heightDimension - 1;
    const allPossibleConfigurations = createDivisionConfigurations(horizontalSeparationPoints);

    let minimumRequiredCuts = heightDimension * widthDimension;

    for (const config of allPossibleConfigurations) {
        if (validateConfiguration(valueGrid, config.separatorMap, capacityLimit, heightDimension, widthDimension)) {
            minimumRequiredCuts = Math.min(minimumRequiredCuts, config.divisionCount);
        }
    }

    console.log(minimumRequiredCuts);
}

coordinateSolution(require("fs").readFileSync("/dev/stdin", "utf8"));