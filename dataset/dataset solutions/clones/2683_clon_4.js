const calculateNextElevation = (precedingElevation, currentRawElevation) =>
    (precedingElevation === currentRawElevation) ? currentRawElevation :
    (precedingElevation <= currentRawElevation - 1) ? currentRawElevation - 1 :
    NaN;

const AssessElevationSeries = (sourceContent) => {
    const numericalComponents = sourceContent.trim().split(/\n|\s/).map(Number);
    const elementCount = numericalComponents[0];
    const elevationMeasures = numericalComponents.slice(1);

    const initialCondition = { feasible: true, latestLevel: elevationMeasures[0] };

    const outcome = elevationMeasures.slice(1).reduce((accumulator, currentElement) => {
        if (!accumulator.feasible) {
            return accumulator;
        }

        const calculatedNext = calculateNextElevation(accumulator.latestLevel, currentElement);

        return {
            feasible: !Number.isNaN(calculatedNext),
            latestLevel: Number.isNaN(calculatedNext) ? accumulator.latestLevel : calculatedNext
        };
    }, initialCondition);

    return outcome.feasible ? 'Yes' : 'No';
};

const inputData = require("fs").readFileSync("/dev/stdin", "utf8");
const resultString = AssessElevationSeries(inputData);
console.log(resultString);