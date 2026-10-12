const dataReader = require('fs');

const checkPrimality = (candidateNumber) => {
    if (candidateNumber < 2) {
        return false;
    }
    if (candidateNumber === 2 || candidateNumber === 3) {
        return true;
    }
    if (candidateNumber % 2 === 0 || candidateNumber % 3 === 0) {
        return false;
    }

    let currentDivisor = 5;
    while (currentDivisor * currentDivisor <= candidateNumber) {
        if (candidateNumber % currentDivisor === 0 || candidateNumber % (currentDivisor + 2) === 0) {
            return false;
        }
        currentDivisor += 6;
    }
    return true;
};

let primeTally = 0;
const rawInputLines = dataReader.readFileSync('/dev/stdin', 'utf-8').split('\n');

for (let lineIndex = 1; lineIndex < rawInputLines.length; lineIndex++) {
    const currentLineText = rawInputLines[lineIndex];
    if (currentLineText.trim() === '') {
        continue;
    }
    const numericValue = Number.parseInt(currentLineText, 10);
    if (checkPrimality(numericValue)) {
        primeTally++;
    }
}

console.log(primeTally);
