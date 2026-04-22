const retrievePathVal = (countMap, horizontal, vertical) => countMap.get(`${horizontal},${vertical}`) || 0;

const updatePathValImmutable = (countMap, horizontal, vertical, additionalValue) => {
    const key = `${horizontal},${vertical}`;
    const newCountMap = new Map(countMap);
    newCountMap.set(key, (newCountMap.get(key) || 0) + additionalValue);
    return newCountMap;
};

const evolvePathState = (currentVerticalLevel, fieldWidth, fieldHeight, entireField, priorCounts) => {
    let subsequentCounts = new Map(priorCounts);

    for (let currentHorizontal = 0; currentHorizontal < fieldWidth; currentHorizontal++) {
        const pathsFromThisSpot = retrievePathVal(priorCounts, currentHorizontal, currentVerticalLevel);

        if (pathsFromThisSpot === 0) continue;

        const spotKind = entireField[currentVerticalLevel][currentHorizontal];

        switch (spotKind) {
            case 0: // Open passage
                // Move diagonally left-down
                if (currentHorizontal > 0 && entireField[currentVerticalLevel + 1][currentHorizontal - 1] !== 2) {
                    subsequentCounts = updatePathValImmutable(subsequentCounts, currentHorizontal - 1, currentVerticalLevel + 1, pathsFromThisSpot);
                }
                // Move straight down
                subsequentCounts = updatePathValImmutable(subsequentCounts, currentHorizontal, currentVerticalLevel + 1, pathsFromThisSpot);
                // Move diagonally right-down
                if (currentHorizontal < fieldWidth - 1 && entireField[currentVerticalLevel + 1][currentHorizontal + 1] !== 2) {
                    subsequentCounts = updatePathValImmutable(subsequentCounts, currentHorizontal + 1, currentVerticalLevel + 1, pathsFromThisSpot);
                }
                break;
            case 1: // Obstruction
                // No paths propagate from here
                break;
            case 2: // Warp gate
                subsequentCounts = updatePathValImmutable(subsequentCounts, currentHorizontal, currentVerticalLevel + 2, pathsFromThisSpot);
                break;
        }
    }
    return subsequentCounts;
};

const computeScenarioTotal = (fieldWidth, fieldHeight, entireField) => {
    let initialPathways = new Map();
    for (let h = 0; h < fieldWidth; h++) {
        if (entireField[0][h] === 0) {
            initialPathways.set(`${h},0`, 1);
        }
    }

    const finalPathwaysMap = Array.from({ length: fieldHeight }).reduce((currentPathways, _, v) => {
        return evolvePathState(v, fieldWidth, fieldHeight, entireField, currentPathways);
    }, initialPathways);

    let ultimateTally = 0;
    for (let h = 0; h < fieldWidth; h++) {
        ultimateTally += retrievePathVal(finalPathwaysMap, h, fieldHeight);
        ultimateTally += retrievePathVal(finalPathwaysMap, h, fieldHeight + 1);
    }
    return ultimateTally;
};

const processAllSituations = (dataLines, initialLinePointer) => {
    const dimensionInfo = dataLines[initialLinePointer];
    const [horizontalExtent, verticalExtent] = dimensionInfo.split(' ').map(Number);

    if (horizontalExtent === 0 && verticalExtent === 0) {
        return [];
    }

    const groundMatrix = dataLines.slice(initialLinePointer + 1, initialLinePointer + 1 + verticalExtent)
                                .map(line => line.split(' ').map(Number));

    const fixedBoundaryLayer = [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2];
    groundMatrix.push(fixedBoundaryLayer);

    const currentSituationResult = computeScenarioTotal(horizontalExtent, verticalExtent, groundMatrix);

    const remainingSituationResults = processAllSituations(dataLines, initialLinePointer + 1 + verticalExtent);

    return [currentSituationResult, ...remainingSituationResults];
};

let accumulatedInputData = '';

const intakeDataFragment = (dataPiece) => {
    accumulatedInputData += dataPiece;
};

const finalizeInputAnalysis = () => {
    const inputRecords = accumulatedInputData.split('\n');
    const computedOutcomes = processAllSituations(inputRecords, 0);

    computedOutcomes.forEach(res => console.log(res));
};

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', intakeDataFragment);
process.stdin.on('end', finalizeInputAnalysis);