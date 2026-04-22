function extractInputData(rawData) {
    const contentLines = rawData.split('\n');
    const headerDetails = contentLines[0].match(/\d+/g).map(Number);
    const valueSet = contentLines[1].match(/\d+/g).map(item => item / 2);

    return {
        _irrelevantCount: headerDetails[0],
        _upperLimit: headerDetails[1],
        _processedValues: valueSet
    };
}

function calculateDivisor(operandOne, operandTwo) {
    while (operandTwo !== 0) {
        const temporary = operandTwo;
        operandTwo = operandOne % operandTwo;
        operandOne = temporary;
    }
    return operandOne;
}

function computeLeastCommonPairwise(valA, valB) {
    if (valA === 0 || valB === 0) {
        return 0;
    }
    return (valA * valB) / calculateDivisor(valA, valB);
}

function determineAggregateLeastCommonMultiple(arrayOfNumbers) {
    if (arrayOfNumbers.length === 0) {
        return 1;
    }
    return arrayOfNumbers.reduce((accumulator, currentNumber) =>
        computeLeastCommonPairwise(accumulator, currentNumber)
    );
}

function computeFinalResultValue(maxBoundary, baseMultiple) {
    if (baseMultiple === 0) {
        return 0;
    }
    const totalMultiplesBelowBoundary = Math.floor(maxBoundary / baseMultiple);
    return Math.floor((totalMultiplesBelowBoundary + 1) / 2);
}

(function executeProgram() {
    const fileSystem = require('fs');
    const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();
    const { _upperLimit, _processedValues } = extractInputData(rawInputContent);

    const overallLCM = determineAggregateLeastCommonMultiple(_processedValues);
    const finalAnswer = computeFinalResultValue(_upperLimit, overallLCM);

    process.stdout.write(finalAnswer.toString() + '\n');
})();