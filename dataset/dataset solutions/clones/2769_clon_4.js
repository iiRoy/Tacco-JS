const processInputData = (incomingText) => {
    const textLines = incomingText.split('\n');
    const numericCount = Number(textLines[0]);
    const numberStrings = textLines[1].split(' ');
    const observationPoints = numberStrings.map(Number);
    return { numericCount, observationPoints };
};

const calculateInitialValue = (pointMeasurements) => {
    return pointMeasurements.reduce((currentTotal, currentMeasure, currentIdx) => {
        return currentTotal + (currentIdx % 2 === 0 ? currentMeasure : -currentMeasure);
    }, 0);
};

const generateResultSequence = (pointMeasurements) => {
    const firstCalculatedValue = calculateInitialValue(pointMeasurements);

    const finalResultArray = pointMeasurements.reduce((collectedValues, _, currentIdx) => {
        if (currentIdx === 0) {
            return collectedValues;
        }
        const previousCalculatedValue = collectedValues[collectedValues.length - 1];
        const correspondingObservation = pointMeasurements[currentIdx - 1];
        const nextCalculatedValue = (correspondingObservation * 2) - previousCalculatedValue;
        collectedValues.push(nextCalculatedValue);
        return collectedValues;
    }, [firstCalculatedValue]);

    return finalResultArray;
};

const formatOutputString = (outputNumbers) => {
    return outputNumbers.map(String).join(' ') + '\n';
};

const executeProcessing = (sourceData) => {
    const { numericCount, observationPoints } = processInputData(sourceData);
    const computedValues = generateResultSequence(observationPoints);
    return formatOutputString(computedValues);
};

console.log(executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8")));