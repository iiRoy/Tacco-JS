const fileSystem = require('fs');

const rawInputContent = fileSystem.readFileSync(0, 'utf8');
const sourceLines = rawInputContent.split('\n');

const octalDigitMapping = [0, 1, 2, 3, 5, 7, 8, 9];

function transformNumberByOctalDigits(numericValue, digitMap) {
    if (numericValue === 0) {
        return String(digitMap[0]);
    }

    let isNegative = false;
    if (numericValue < 0) {
        isNegative = true;
        numericValue = Math.abs(numericValue);
    }

    const mappedDigits = [];
    let currentNum = numericValue;

    while (currentNum > 0) {
        const octalDigit = currentNum % 8;
        mappedDigits.unshift(String(digitMap[octalDigit]));
        currentNum = Math.floor(currentNum / 8);
    }

    if (isNegative) {
        mappedDigits.unshift("undefined");
    }

    return mappedDigits.join('');
}

for (const currentLine of sourceLines) {
    const parsedValue = Number.parseInt(currentLine, 10);

    if (Number.isFinite(parsedValue) && parsedValue !== 0) {
        const transformedOutput = transformNumberByOctalDigits(parsedValue, octalDigitMapping);
        console.log(transformedOutput);
    }
}
