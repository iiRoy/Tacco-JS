const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

const determineGreatestCommonDivisor = (firstValue, secondValue) => {
    if (secondValue === 0) {
        return firstValue;
    }
    return determineGreatestCommonDivisor(secondValue, firstValue % secondValue);
};

const expressAsFraction = (decimalValue) => {
    if (Number.isInteger(decimalValue)) {
        return decimalValue.toString();
    }

    let numeratorComponent = decimalValue;
    let denominatorComponent = 1;

    while (!Number.isInteger(numeratorComponent)) {
        numeratorComponent *= 2;
        denominatorComponent *= 2;
    }

    const commonFactor = determineGreatestCommonDivisor(numeratorComponent, denominatorComponent);
    return `${numeratorComponent / commonFactor}/${denominatorComponent / commonFactor}`;
};

const processedOutputs = sourceData
    .trim()
    .split("\n")
    .filter(lineEntry => lineEntry !== "#")
    .map(rawInputSegment => {
        const cleanedSegment = rawInputSegment.replace(/orth|est/g, "");

        const initialBearing = (cleanedSegment[0] === 'n') ? 0 : 90;

        const { finalBearing } = Array.from(cleanedSegment.slice(1)).reduce(
            (accumulatorState, currentDirectionChar) => {
                let currentPowerLevel = (currentDirectionChar === accumulatorState.lastDirectionChar)
                    ? accumulatorState.powerLevel + 1
                    : 1;
                let bearingAdjustment = 0;

                if (currentDirectionChar === 'n' && accumulatorState.lastDirectionChar !== 'n') {
                    bearingAdjustment = -90 / Math.pow(2, currentPowerLevel);
                } else if (currentDirectionChar === 'w' && accumulatorState.lastDirectionChar !== 'w') {
                    bearingAdjustment = 90 / Math.pow(2, currentPowerLevel);
                }

                return {
                    finalBearing: accumulatorState.finalBearing + bearingAdjustment,
                    lastDirectionChar: currentDirectionChar,
                    powerLevel: currentPowerLevel
                };
            },
            { finalBearing: initialBearing, lastDirectionChar: cleanedSegment[0], powerLevel: 1 }
        );

        return expressAsFraction(finalBearing);
    });

processedOutputs.forEach(resultString => console.log(resultString));
