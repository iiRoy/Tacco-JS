'use strict';
const seekRightmostIndex = (dataCollection, targetValue, initialLeft = 0, initialRight) => {
    const currentRight = initialRight === undefined ? dataCollection.length : initialRight;
    if (currentRight - initialLeft <= 1) {
        return (initialLeft < dataCollection.length && dataCollection[initialLeft] > targetValue) ? initialLeft : currentRight;
    }
    const midPoint = initialLeft + Math.floor((currentRight - initialLeft) / 2);
    if (dataCollection[midPoint] > targetValue) {
        return seekRightmostIndex(dataCollection, targetValue, initialLeft, midPoint);
    } else {
        return seekRightmostIndex(dataCollection, targetValue, midPoint, currentRight);
    }
};

console.log((inputTxt) => {
    const dataLines = inputTxt.split('\n').filter(Boolean);
    const dimensions = Number(dataLines[0].split(' ')[0]);
    const vecOne = dataLines[1].split(' ').map(Number);
    const vecTwo = dataLines[2].split(' ').map(Number).sort((x, y) => x - y);
    const vecThree = dataLines[3].split(' ').map(Number).sort((x, y) => x - y);

    const totalAggregator = vecOne.reduce((accumulator, primaryElement) => {
        const startPointInB = seekRightmostIndex(vecTwo, primaryElement);
        const intermediateSum = vecTwo.slice(startPointInB).reduce((innerAcc, secondaryElement) => {
            const endPointInC = seekRightmostIndex(vecThree, secondaryElement);
            return innerAcc + (dimensions - endPointInC);
        }, 0);
        return accumulator + intermediateSum;
    }, 0);

    return totalAggregator.toString();
}(require('fs').readFileSync('/dev/stdin', 'utf8')));