const customModulo = (dividend, divisor) => dividend - Math.floor(dividend / divisor) * divisor;
const customMin = (valA, valB) => (valA < valB ? valA : valB);
const roundPositiveFloat = (num) => Math.floor(num + 0.5);

const obtainMinimalDispersionValue = (primarySpan, secondarySpan) => {
    if (customModulo(primarySpan, 3) === 0 || customModulo(secondarySpan, 3) === 0) {
        return 0;
    }

    const candidateValues = [];
    
    candidateValues.push(primarySpan);
    candidateValues.push(secondarySpan);

    candidateValues.push(
        customModulo(primarySpan, 2) === 0
            ? primarySpan / 2
            : (3 * primarySpan + 2 * secondarySpan - 1) / 6
    );

    candidateValues.push(
        customModulo(secondarySpan, 2) === 0
            ? secondarySpan / 2
            : (3 * secondarySpan + 2 * primarySpan - 1) / 6
    );

    return candidateValues.reduce(customMin, Number.POSITIVE_INFINITY);
};

const parseInputDimensions = (incomingDataPacket) => {
    const segmentArray = incomingDataPacket.split('\n');
    const initialSegmentElements = segmentArray[0].split(' ');
    const firstMagnitude = Number(initialSegmentElements[0]);
    const secondMagnitude = Number(initialSegmentElements[1]);
    return { firstMagnitude, secondMagnitude };
};

const reportFinalResult = (numericalValue) => {
    process.stdout.write(roundPositiveFloat(numericalValue).toString() + '\n');
};

const acquireDataStream = () => {
    const fileSystemModule = require("node:fs");
    return fileSystemModule.readFileSync(0, "utf8");
};

const topLevelExecution = () => {
    const rawData = acquireDataStream();
    const { firstMagnitude, secondMagnitude } = parseInputDimensions(rawData);
    const calculatedDispersion = obtainMinimalDispersionValue(firstMagnitude, secondMagnitude);
    reportFinalResult(calculatedDispersion);
};

topLevelExecution();