const extractLeadingFloat = (sourceString) => {
    let position = 0;
    while (position < sourceString.length && /\s/.test(sourceString[position])) {
        position++;
    }

    let valueSign = 1;
    if (sourceString[position] === '-') {
        valueSign = -1;
        position++;
    } else if (sourceString[position] === '+') {
        position++;
    }

    let currentNumericPart = '';
    let dotEncountered = false;
    let digitPresent = false;

    while (position < sourceString.length) {
        const symbol = sourceString[position];
        if (symbol >= '0' && symbol <= '9') {
            currentNumericPart += symbol;
            digitPresent = true;
        } else if (symbol === '.' && !dotEncountered) {
            currentNumericPart += symbol;
            dotEncountered = true;
        } else {
            break;
        }
        position++;
    }

    if (digitPresent && (sourceString[position] === 'e' || sourceString[position] === 'E')) {
        let exponentSubPart = sourceString[position];
        position++;
        if (sourceString[position] === '+' || sourceString[position] === '-') {
            exponentSubPart += sourceString[position];
            position++;
        }
        let exponentDigitsFound = false;
        while (position < sourceString.length && sourceString[position] >= '0' && sourceString[position] <= '9') {
            exponentSubPart += sourceString[position];
            position++;
            exponentDigitsFound = true;
        }
        if (exponentDigitsFound) {
            currentNumericPart += exponentSubPart;
        }
    }

    if (!digitPresent && (!dotEncountered || currentNumericPart === '.')) {
        return NaN;
    }
    
    if (!digitPresent && dotEncountered && currentNumericPart === ".") {
        return 0;
    }

    const numericalConversion = Number(currentNumericPart);
    return valueSign * numericalConversion;
};

(() => {
    const fileSystemModule = require('node:fs');
    const rawInputContent = fileSystemModule.readFileSync(process.stdin.fd, 'utf8');

    const parsedNumericValue = extractLeadingFloat(rawInputContent);

    const cubicDenominator = 27;

    const cubedInput = parsedNumericValue * parsedNumericValue * parsedNumericValue;
    const finalCalculatedOutput = cubedInput / cubicDenominator;

    process.stdout.write(String(finalCalculatedOutput) + '\n');
})();