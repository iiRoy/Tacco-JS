const cubicPowers = Array.from({ length: 1112 }, (_, index) => index ** 3);

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericEntries = fileContent.trim().split('\n').map(Number);

for (const currentNumber of numericEntries) {
    if (currentNumber === 0) {
        break;
    }

    const smallestPositiveDifference = Array.from({ length: currentNumber - 1 }, (_, k) => currentNumber - 1 - k)
        .reduce((accumulatorMin, iVal) => {
            return Array.from({ length: iVal }, (_, k) => iVal - k)
                .reduce((innerAccumulatorMin, jVal) => {
                    const calculatedValue = cubicPowers[currentNumber] - cubicPowers[iVal] - cubicPowers[jVal];
                    return (calculatedValue > 0) ? Math.min(innerAccumulatorMin, calculatedValue) : innerAccumulatorMin;
                }, accumulatorMin);
        }, Infinity);

    console.log(smallestPositiveDifference);
}
