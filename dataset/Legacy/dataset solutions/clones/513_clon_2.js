const fileSystem = require('fs');

let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

let lineSegments = rawData.trim().split('\n');

while (true) {
    let countVal = lineSegments.shift() - 0x0;

    if (countVal === 0) {
        break;
    }

    let primaryNums = lineSegments.shift().split(' ').map(Number);

    let secondaryNums = lineSegments.shift().split(' ').map(Number);

    let totalPrimary = primaryNums.reduce(function (accumulator, currentVal) {
        return accumulator + currentVal;
    });

    secondaryNums.sort(function (firstElement, secondElement) {
        return secondElement - firstElement;
    });

    let greatestProduct = totalPrimary * countVal;

    while (true) {
        if (secondaryNums.length === 0) {
            break;
        }

        countVal--;

        greatestProduct = Math.max(greatestProduct, (totalPrimary + secondaryNums.shift()) * countVal);
    }

    console.log(greatestProduct);
}
