function processInputData(rawText) {
    const lines = rawText.trim().split("\n");
    lines.shift();
    return lines.map(lineContent => {
        const parts = lineContent.split(" ");
        return [BigInt(parts[0]), BigInt(parts[1])];
    });
}

const computeCeilingDivision = (numeratorValue, denominatorValue) => {
    return (numeratorValue / denominatorValue) + (numeratorValue % denominatorValue !== 0n ? 1n : 0n);
};

const determineMaxBigInt = (...bigIntValues) => bigIntValues.reduce((currentMax, value) => (value > currentMax ? value : currentMax));

function calculateFinalPair(listOfPairs) {
    const startingAccumulator = [0n, 0n];

    const resultantPair = listOfPairs.reduce((currentAccumulatedPair, currentItemPair) => {
        const [accumulatedT, accumulatedA] = currentAccumulatedPair;
        const [itemT, itemA] = currentItemPair;

        const scaleFactorForT = accumulatedT > itemT ? computeCeilingDivision(accumulatedT, itemT) : 1n;
        const scaleFactorForA = accumulatedA > itemA ? computeCeilingDivision(accumulatedA, itemA) : 1n;

        const effectiveScalingMultiplier = determineMaxBigInt(1n, scaleFactorForT, scaleFactorForA);

        return [itemT * effectiveScalingMultiplier, itemA * effectiveScalingMultiplier];
    }, startingAccumulator);

    return resultantPair;
}

function ProcessInputAndOutput(fullInputString) {
    const parsedBigIntPairs = processInputData(fullInputString);
    const finalResultPair = calculateFinalPair(parsedBigIntPairs);
    console.log((finalResultPair[0] + finalResultPair[1]).toString());
}

ProcessInputAndOutput(require("fs").readFileSync("/dev/stdin", "utf8"));
