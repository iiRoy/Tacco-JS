const rawDataString = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputLines = rawDataString.trim().split('\n');

if (inputLines.length < 2) {
    console.error("Error: Expected at least two lines of input data.");
    process.exit(1);
}

const configParametersString = inputLines[0];
const valueSequenceString = inputLines[1];

const configValues = configParametersString.split(' ').map(val => parseInt(val.trim(), 10));

if (configValues.length < 2 || isNaN(configValues[0]) || isNaN(configValues[1])) {
    console.error("Error: Unable to parse configuration parameters (N and M) from the first line.");
    process.exit(1);
}

const numPointsToSelect = configValues[0];
const totalPointsAvailable = configValues[1];

const rawNumericValues = valueSequenceString.split(' ').map(val => parseInt(val.trim(), 10));

const numericDataSet = rawNumericValues.filter(val => !isNaN(val));

if (numericDataSet.length !== totalPointsAvailable) {
    console.error(`Error: M value (${totalPointsAvailable}) does not match the actual count of provided numeric points (${numericDataSet.length}).`);
    process.exit(1);
}

const orderedNumericSet = [...numericDataSet].sort((firstEl, secondEl) => firstEl - secondEl);

const adjacentSegmentLengths = Array.from({ length: totalPointsAvailable - 1 }, (_, index) => {
    return orderedNumericSet[index + 1] - orderedNumericSet[index];
});

const sortedSegmentLengths = [...adjacentSegmentLengths].sort((diffA, diffB) => diffA - diffB);

let minimalSeparationCost = 0;

if (numPointsToSelect < totalPointsAvailable) {
    const segmentsToMaintainCount = totalPointsAvailable - numPointsToSelect;

    const smallestGapsToKeep = sortedSegmentLengths.slice(0, segmentsToMaintainCount);

    minimalSeparationCost = smallestGapsToKeep.reduce((accumulator, currentDifference) => {
        return accumulator + currentDifference;
    }, 0);
}

const presentOutcome = () => {
    if (numPointsToSelect >= totalPointsAvailable) {
        console.log(0);
        return;
    }
    console.log(minimalSeparationCost);
    return;
};

presentOutcome();