const obtainDescendingSegmentLengths = (numericalSequence) => {
    const comparisonIndicators = Array.from({ length: numericalSequence.length + 1 }, (_, positionIndex) => {
        const presentElement = numericalSequence[positionIndex];
        const subsequentElement = numericalSequence[positionIndex + 1];
        return presentElement >= subsequentElement;
    });

    const collectedDurations = comparisonIndicators.reduce((stateContainer, isDescending) => {
        const { currentDuration, allDurations } = stateContainer;
        return isDescending
            ? { currentDuration: currentDuration + 1, allDurations }
            : { currentDuration: 0, allDurations: [...allDurations, currentDuration] };
    }, { currentDuration: 0, allDurations: [] });

    return collectedDurations.allDurations;
};

const fileSystemAccess = require('fs');
const dataSourceLines = fileSystemAccess.readFileSync('/dev/stdin', 'utf8').split('\n');
const numericValues = dataSourceLines[1].split(" ").map( textualFragment => Number(textualFragment));

const calculatedDurations = obtainDescendingSegmentLengths(numericValues);
console.log(Math.max(...calculatedDurations));