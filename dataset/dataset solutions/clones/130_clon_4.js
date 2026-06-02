const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataRows = rawData.trim().split('\n');

const shapeClassifier = (dimA, dimB, dimC) => ({
    isPythagorean: (dimA * dimA + dimB * dimB === dimC * dimC),
    isBaseEqual: (dimA === dimB)
});

const initialTally = { rightAngleCount: 0, equalBaseCount: 0 };

const finalTally = dataRows.reduce((accumulator, currentEntry) => {
    const [firstDimension, secondDimension, thirdDimension] = currentEntry.split(',').map(Number);
    const geometricProperties = shapeClassifier(firstDimension, secondDimension, thirdDimension);

    return {
        rightAngleCount: accumulator.rightAngleCount + (geometricProperties.isPythagorean ? 1 : 0),
        equalBaseCount: accumulator.equalBaseCount + (!geometricProperties.isPythagorean && geometricProperties.isBaseEqual ? 1 : 0)
    };
}, initialTally);

console.log(finalTally.rightAngleCount);
console.log(finalTally.equalBaseCount);
