function locateInsertionIndex(collection, targetValue, lowerBound, upperBound) {
    while (lowerBound < upperBound) {
        const midPoint = Math.floor((lowerBound + upperBound) / 2);
        if (collection[midPoint] < targetValue) {
            lowerBound = midPoint + 1;
        } else {
            upperBound = midPoint;
        }
    }
    return lowerBound;
}

function calculateSequenceLength() {
    T[0] = 0;

    const endValues = [];

    for (let i = 0; i < T.length; i++) {
        const currentElement = T[i];

        const insertionSpot = locateInsertionIndex(endValues, currentElement, 0, endValues.length);

        if (insertionSpot === endValues.length) {
            endValues.push(currentElement);
        } else {
            endValues[insertionSpot] = currentElement;
        }
    }

    const finalResult = endValues.length - 1;
    console.log(finalResult);
}

var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var T = (input.trim()).split("\n").map(Number);
calculateSequenceLength();
