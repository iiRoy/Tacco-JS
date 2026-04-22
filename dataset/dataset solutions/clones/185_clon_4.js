const inputSource = require('fs');
const rawContent = inputSource.readFileSync('/dev/stdin', 'utf8');
const lineSet = rawContent.split('\n');

let currentMaximum = Number.NEGATIVE_INFINITY;
let currentMinimum = Number.POSITIVE_INFINITY;
let hasValidNumber = false;

for (let lineItem of lineSet) {
    const parsedNumber = parseFloat(lineItem.trim());
    if (!isNaN(parsedNumber)) {
        if (!hasValidNumber) {
            currentMaximum = parsedNumber;
            currentMinimum = parsedNumber;
            hasValidNumber = true;
        } else {
            if (parsedNumber > currentMaximum) {
                currentMaximum = parsedNumber;
            }
            if (parsedNumber < currentMinimum) {
                currentMinimum = parsedNumber;
            }
        }
    }
}

let calculatedRange;
if (hasValidNumber) {
    calculatedRange = currentMaximum - currentMinimum;
} else {
    calculatedRange = NaN;
}

const finalDisplay = calculatedRange.toFixed(2);

console.log(finalDisplay);