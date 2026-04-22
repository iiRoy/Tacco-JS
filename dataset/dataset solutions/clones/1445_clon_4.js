let sourcePayload = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineSegments = sourcePayload.trim().split('\n');

let currentReadPointer = 0;

while (true) {
    if (currentReadPointer >= lineSegments.length) {
        break;
    }

    let itemQuantity = parseInt(lineSegments[currentReadPointer++], 10);

    if (itemQuantity === 0) {
        break;
    }

    if (currentReadPointer >= lineSegments.length) {
        break;
    }

    let numericCollection = lineSegments[currentReadPointer++].split(' ').map(val => parseFloat(val));

    let populationSize = numericCollection.length;
    let totalValue = 0.0;
    let totalSquaredValue = 0.0;

    for (let currentElement of numericCollection) {
        totalValue += currentElement;
        totalSquaredValue += (currentElement * currentElement);
    }

    let averageOfValues = totalValue / populationSize;
    let averageOfSquaredValues = totalSquaredValue / populationSize;

    let varianceMeasure = averageOfSquaredValues - (averageOfValues * averageOfValues);

    if (varianceMeasure < 0) {
        varianceMeasure = 0;
    }

    let dispersionResult = Math.sqrt(varianceMeasure);

    console.log(dispersionResult.toFixed(8));
}