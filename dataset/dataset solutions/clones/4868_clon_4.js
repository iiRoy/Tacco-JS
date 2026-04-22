const acquireSpatialData = (inputSource) => {
    const textualLines = inputSource.trim().split('\n');
    const [rowQuantity, colQuantity] = textualLines[0].split(' ').map(Number);
    const topographicalMap = textualLines.slice(1, rowQuantity + 1).map(line => line.split(''));
    return {
        verticalExtent: rowQuantity,
        horizontalExtent: colQuantity,
        terrainFeatures: topographicalMap
    };
};

const analyzeSegmentViability = (
    currentVerticalIndex,
    totalVerticalSpan,
    totalHorizontalSpan,
    completeTerrainMap,
    priorSegmentCondition
) => {
    if (currentVerticalIndex >= totalVerticalSpan) {
        return { viability: "Impossible" };
    }

    let nextSegmentCondition = Array(totalHorizontalSpan).fill(false);
    let activeElementsInNextSegment = 0;

    for (let currentHorizontalIndex = 0; currentHorizontalIndex < totalHorizontalSpan; currentHorizontalIndex++) {
        if (completeTerrainMap[currentVerticalIndex][currentHorizontalIndex] === '#' &&
            currentHorizontalIndex + 1 < totalHorizontalSpan && currentVerticalIndex + 1 < totalVerticalSpan &&
            completeTerrainMap[currentVerticalIndex][currentHorizontalIndex + 1] === '#' &&
            completeTerrainMap[currentVerticalIndex + 1][currentHorizontalIndex] === '#') {
            return { viability: "Impossible" };
        }

        if (currentVerticalIndex === totalVerticalSpan - 1 && currentHorizontalIndex === totalHorizontalSpan - 1 && completeTerrainMap[currentVerticalIndex][currentHorizontalIndex] === '#') {
            return { viability: "Possible" };
        }

        if (completeTerrainMap[currentVerticalIndex][currentHorizontalIndex] === '#') {
            const elementAboveWasDormant = !priorSegmentCondition[currentHorizontalIndex];
            const elementToLeftWasOriginalDormant = (currentHorizontalIndex === 0 || completeTerrainMap[currentVerticalIndex][currentHorizontalIndex - 1] === '.');

            if (elementAboveWasDormant && elementToLeftWasOriginalDormant) {
                nextSegmentCondition[currentHorizontalIndex] = false;
            } else {
                nextSegmentCondition[currentHorizontalIndex] = true;
                activeElementsInNextSegment++;
            }
        } else {
            nextSegmentCondition[currentHorizontalIndex] = false;
        }
    }

    if (currentVerticalIndex > 0 && activeElementsInNextSegment === 0) {
        return { viability: "Impossible" };
    }

    return analyzeSegmentViability(
        currentVerticalIndex + 1,
        totalVerticalSpan,
        totalHorizontalSpan,
        completeTerrainMap,
        nextSegmentCondition
    );
};

const processTopography = (sourceMaterialString) => {
    const { verticalExtent, horizontalExtent, terrainFeatures } = acquireSpatialData(sourceMaterialString);

    let initialProcessedSegment = Array(horizontalExtent).fill(false);
    for (let x = 0; x < horizontalExtent; x++) {
        initialProcessedSegment[x] = (terrainFeatures[0][x] === '#');
    }

    const finalDecision = analyzeSegmentViability(
        1,
        verticalExtent,
        horizontalExtent,
        terrainFeatures,
        initialProcessedSegment
    );

    return finalDecision.viability;
};

console.log(processTopography(require("fs").readFileSync("/dev/stdin", "utf8")));