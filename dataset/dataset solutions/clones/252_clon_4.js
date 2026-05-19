const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const dataLines = inputSource.split('\n');

let finalSum = 0;

for (const currentTextLine of dataLines) {
    let lineNumericTotal = 0;
    let currentNumberString = '';

    for (let charIndex = 0; charIndex < currentTextLine.length; charIndex++) {
        const char = currentTextLine[charIndex];
        if (char >= '0' && char <= '9') {
            currentNumberString += char;
        } else {
            if (currentNumberString.length > 0) {
                lineNumericTotal += Number(currentNumberString);
                currentNumberString = '';
            }
        }
    }
    if (currentNumberString.length > 0) {
        lineNumericTotal += Number(currentNumberString);
    }
    finalSum += lineNumericTotal;
}

console.log(finalSum);
