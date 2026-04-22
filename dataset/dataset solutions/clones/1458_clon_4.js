function digitValue(char) {
    const code = char.charCodeAt(0);
    if (code >= 48 && code <= 57) {
        return code - 48;
    }
    return -1;
}

function convertToInteger(inputString) {
    let result = 0;
    let sign = 1;
    let index = 0;
    while (index < inputString.length && (inputString[index] === ' ' || inputString[index] === '\t')) {
        index++;
    }
    if (inputString[index] === '-') {
        sign = -1;
        index++;
    } else if (inputString[index] === '+') {
        index++;
    }
    while (index < inputString.length) {
        const digit = digitValue(inputString[index]);
        if (digit !== -1) {
            result = result * 10 + digit;
        } else {
            break;
        }
        index++;
    }
    return result * sign;
}

function convertToFloat(inputString) {
    return Number(inputString);
}

function divideByWhitespace(text) {
    let components = [];
    let currentComponent = '';
    let inComponent = false;
    for (let k = 0; k < text.length; k++) {
        const character = text[k];
        if (character === ' ' || character === '\t' || character === '\n' || character === '\r') {
            if (inComponent) {
                components.push(currentComponent);
                currentComponent = '';
                inComponent = false;
            }
        } else {
            currentComponent += character;
            inComponent = true;
        }
    }
    if (inComponent) {
        components.push(currentComponent);
    }
    return components.filter(c => c !== '');
}

function findCollectionSum(dataElements, currentTotal = 0) {
    if (dataElements.length === 0) return currentTotal;
    return findCollectionSum(dataElements.slice(1), currentTotal + dataElements[0]);
}

function findSumOfSquaredDifferences(dataElements, centralValue, currentTotal = 0) {
    if (dataElements.length === 0) return currentTotal;
    const difference = dataElements[0] - centralValue;
    return findSumOfSquaredDifferences(dataElements.slice(1), centralValue, currentTotal + (difference * difference));
}

function calculateSquareRoot(val) {
    return Math.sqrt(val);
}

function createFixedPointString(numericalValue, decimalPlaces) {
    if (isNaN(numericalValue)) {
        return "NaN";
    }

    let powerOfTen = 1;
    for (let p = 0; p < decimalPlaces; p++) {
        powerOfTen *= 10;
    }
    const adjustedValue = Math.round(numericalValue * powerOfTen);
    let strRep = String(adjustedValue);

    let isNegative = false;
    if (strRep[0] === '-') {
        isNegative = true;
        strRep = strRep.substring(1);
    }

    while (strRep.length <= decimalPlaces) {
        strRep = '0' + strRep;
    }

    const integerPart = strRep.substring(0, strRep.length - decimalPlaces);
    const fractionalPart = strRep.substring(strRep.length - decimalPlaces);

    return (isNegative ? '-' : '') + (integerPart === '' ? '0' : integerPart) + '.' + fractionalPart;
}

function* lineSourceGenerator(fullContent) {
    const linesArray = fullContent.split('\n');
    for (const currentSegment of linesArray) {
        yield currentSegment;
    }
}

function processDataBlock(lineIteratorInstance) {
    const elementCountLine = lineIteratorInstance.next();

    if (elementCountLine.done) {
        return;
    }

    const currentElementCount = convertToInteger(elementCountLine.value);

    if (currentElementCount === 0) {
        return;
    }

    const dataValueLine = lineIteratorInstance.next();
    if (dataValueLine.done) {
        return;
    }

    const rawValues = divideByWhitespace(dataValueLine.value);
    const numericalValues = [];
    for (let j = 0; j < rawValues.length; j++) {
        numericalValues.push(convertToFloat(rawValues[j]));
    }

    const countOfNumericalValues = numericalValues.length;
    if (countOfNumericalValues === 0) {
        process.stdout.write("NaN\n");
        processDataBlock(lineIteratorInstance);
        return;
    }

    const centralTendencyValue = findCollectionSum(numericalValues) / countOfNumericalValues;
    const dispersionMeasureValue = findSumOfSquaredDifferences(numericalValues, centralTendencyValue) / countOfNumericalValues;
    const spreadIndicatorValue = calculateSquareRoot(dispersionMeasureValue);

    process.stdout.write(createFixedPointString(spreadIndicatorValue, 6) + '\n');

    processDataBlock(lineIteratorInstance);
}

let entirePayload = '';

process.stdin.on('data', (dataSegment) => {
    entirePayload += dataSegment.toString();
});

process.stdin.on('end', () => {
    const lineGenerator = lineSourceGenerator(entirePayload);
    processDataBlock(lineGenerator);
});