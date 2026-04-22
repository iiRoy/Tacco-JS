const acquireNumericSequence = (textSegment) => textSegment.split(" ").map(Number);

function* createDistinctPermutations(elementSet, permutationLength) {
    if (permutationLength === 0) {
        yield [];
        return;
    }
    for (let i = 0; i < elementSet.length; i++) {
        const currentElement = elementSet[i];
        const remainingElements = [...elementSet.slice(0, i), ...elementSet.slice(i + 1)];
        for (const subPermutation of createDistinctPermutations(remainingElements, permutationLength - 1)) {
            yield [currentElement, ...subPermutation];
        }
    }
}

const processGridTransformation = (sourceData) => {
    const dataLines = sourceData.split('\n');

    const [gridSize, paletteSize] = acquireNumericSequence(dataLines[0]);

    const alterationCosts = dataLines.slice(1, 1 + paletteSize)
        .map(acquireNumericSequence);

    const initialGridConfiguration = dataLines.slice(1 + paletteSize, 1 + paletteSize + gridSize)
        .map(line => acquireNumericSequence(line).map(val => val - 1));

    const colorParityCounts = Array.from({ length: 3 }, () => new Map());

    initialGridConfiguration.forEach((row, rowIndex) => {
        row.forEach((originalColorValue, colIndex) => {
            const parityGroup = (rowIndex + colIndex) % 3;
            const currentCount = colorParityCounts[parityGroup].get(originalColorValue) || 0;
            colorParityCounts[parityGroup].set(originalColorValue, currentCount + 1);
        });
    });

    let optimalTransformationCost = Number.MAX_SAFE_INTEGER;

    const availableColorIndices = Array.from({ length: paletteSize }, (_, idx) => idx);
    for (const [assignedColorForGroup0, assignedColorForGroup1, assignedColorForGroup2] of createDistinctPermutations(availableColorIndices, 3)) {
        let currentCombinationCost = 0;

        colorParityCounts[0].forEach((count, originalColor) => {
            currentCombinationCost += count * alterationCosts[originalColor][assignedColorForGroup0];
        });

        colorParityCounts[1].forEach((count, originalColor) => {
            currentCombinationCost += count * alterationCosts[originalColor][assignedColorForGroup1];
        });

        colorParityCounts[2].forEach((count, originalColor) => {
            currentCombinationCost += count * alterationCosts[originalColor][assignedColorForGroup2];
        });

        optimalTransformationCost = Math.min(optimalTransformationCost, currentCombinationCost);
    }

    console.log(optimalTransformationCost);
};

processGridTransformation(require("fs").readFileSync("/dev/stdin", "utf8"));