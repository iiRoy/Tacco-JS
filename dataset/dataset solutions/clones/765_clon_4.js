const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSource = rawData.trim().split('\n');

let currentLine;
while ((currentLine = lineSource.shift()) !== undefined) {
    const parts = currentLine.split(' ').map(Number);
    const countVal = parts[0];
    const limitVal = parts[1];

    if (countVal === 0 && limitVal === 0) {
        break;
    }

    const itemCosts = lineSource.shift().split(' ').map(Number);

    const validSums = itemCosts.reduce((accumulator, currentCost, currentIndex, sourceArray) => {
        for (let j = currentIndex + 1; j < sourceArray.length; j++) {
            const otherCost = sourceArray[j];
            const currentPairSum = currentCost + otherCost;

            if (currentPairSum <= limitVal) {
                accumulator.push(currentPairSum);
            }
        }
        return accumulator;
    }, []);

    const highestSum = validSums.reduce((maxFound, currentSum) => {
        return Math.max(maxFound, currentSum);
    }, -1);

    if (highestSum !== -1) {
        console.log(highestSum);
    } else {
        console.log('NONE');
    }
}
