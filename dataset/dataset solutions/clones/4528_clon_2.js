'use strict';

function processInput(rawData) {

    rawData = rawData.split(/\n/);
    const countOfItems = ~~rawData[0];

    // This section processes the second line of input:
    // It splits the string by spaces, converts each part to a number,
    // removes any duplicate numeric values, and then sorts the remaining unique numbers in ascending order.
    let uniqueLocations = rawData[1].split(' ').map(currentVal => ~~currentVal).filter((currentVal, idx, arrRef) => {
        return arrRef.indexOf(currentVal) === idx;
    }).sort((firstElement, secondElement) => firstElement - secondElement);

    const resultDifference = uniqueLocations[uniqueLocations.length - 1] - uniqueLocations[0];

    console.log(resultDifference);

}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
