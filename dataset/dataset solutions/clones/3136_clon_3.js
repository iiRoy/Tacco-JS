'use strict'

const parseDimensionValue = (stringValue) => {
    return parseInt(stringValue, 10);
};

const executeProcessing = rawInputString => {
    const lineSegments = rawInputString.split('\n').map(line => line.split(' '));

    const firstDimensionSet = lineSegments[0];
    const dimH1 = parseDimensionValue(firstDimensionSet[0]);
    const dimW1 = parseDimensionValue(firstDimensionSet[1]);

    const secondDimensionSet = lineSegments[1];
    const dimH2 = parseDimensionValue(secondDimensionSet[0]);
    const dimW2 = parseDimensionValue(secondDimensionSet[1]);

    const totalInitialArea = dimH1 * dimW1;

    const areaOfTopRemovedRectangle = dimW1 * dimH2;

    const remainingHeightAfterTopRemoval = dimH1 - dimH2;

    const areaOfBottomLeftRemovedRectangle = remainingHeightAfterTopRemoval * dimW2;

    const totalAreaToSubtract = areaOfTopRemovedRectangle + areaOfBottomLeftRemovedRectangle;

    const finalCalculatedResult = totalInitialArea - totalAreaToSubtract;

    console.log(finalCalculatedResult);
};

executeProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));
