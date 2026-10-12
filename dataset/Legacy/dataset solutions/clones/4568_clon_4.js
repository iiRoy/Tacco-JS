const LRG_NUM_BASE = 10n;
const ZRO_VAL = 0n;
const ONE_UNIT = 1n;
const TWO_UNITS = 2n;

const processInputToBigNum = (valInput) => {
    if (typeof valInput === 'bigint') return valInput;
    if (typeof valInput === 'number') return BigInt(valInput);
    if (typeof valInput === 'string') return BigInt(valInput);
    throw new Error("Invalid type for big number conversion.");
};

const arrangeBigNumList = (list) => list.slice().sort((a, b) => (a < b ? -1n : a > b ? 1n : ZRO_VAL));

const computeAreaSpread = (areaTriad) => {
    const orderedAreas = arrangeBigNumList(areaTriad);
    return orderedAreas[2] - orderedAreas[0];
};

function* generateSplitPoints(maxDimension) {
    let currentSplit = ONE_UNIT;
    while (currentSplit < maxDimension) {
        yield currentSplit;
        currentSplit += ONE_UNIT;
    }
}

const findMinSpreadForDimensions = (dimA, dimB) => {
    let currentMinRange = dimA * dimB;

    for (const splitPoint of generateSplitPoints(dimA)) {
        const primaryPieceArea = splitPoint * dimB;
        const remainingPrimaryMeasure = dimA - splitPoint;
        const totalArea = dimA * dimB;

        const layoutA_part2 = remainingPrimaryMeasure * (dimB / TWO_UNITS);
        const layoutA_part3 = totalArea - (primaryPieceArea + layoutA_part2);
        const rangeA = computeAreaSpread([primaryPieceArea, layoutA_part2, layoutA_part3]);

        const layoutB_part2 = (remainingPrimaryMeasure / TWO_UNITS) * dimB;
        const layoutB_part3 = totalArea - (primaryPieceArea + layoutB_part2);
        const rangeB = computeAreaSpread([primaryPieceArea, layoutB_part2, layoutB_part3]);

        const smallestOfCurrentSplits = (rangeA < rangeB) ? rangeA : rangeB;
        currentMinRange = (currentMinRange < smallestOfCurrentSplits) ? currentMinRange : smallestOfCurrentSplits;
    }
    return currentMinRange;
};

const orchestrateRectangleAnalysis = (rawInputContent) => {
    const contentLines = rawInputContent.trim().split("\n");
    const dimensionsTokens = contentLines[0].split(" ");
    let firstMeasurement = processInputToBigNum(dimensionsTokens[0]);
    let secondMeasurement = processInputToBigNum(dimensionsTokens[1]);

    const outcomeOne = findMinSpreadForDimensions(firstMeasurement, secondMeasurement);
    const outcomeTwo = findMinSpreadForDimensions(secondMeasurement, firstMeasurement);

    const finalResult = (outcomeOne < outcomeTwo) ? outcomeOne : outcomeTwo;

    console.log(finalResult.toString());
};

orchestrateRectangleAnalysis(require('fs').readFileSync('/dev/stdin', 'utf8'));