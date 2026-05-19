function calculateGCD(firstValue, secondValue) {
    while (secondValue !== 0) {
        let temporary = secondValue;
        secondValue = firstValue % secondValue;
        firstValue = temporary;
    }
    return firstValue;
}

function calculatePairwiseLCM(valOne, valTwo) {
    if (valOne === 0 || valTwo === 0) return 0;
    return Math.abs(valOne * valTwo) / calculateGCD(valOne, valTwo);
}

function computeLeastCommonMultiple(valueSequence) {
    if (valueSequence.length === 0) return 1;
    if (valueSequence.length === 1) return valueSequence[0];

    return valueSequence.reduce((currentAccumulator, nextElement) => calculatePairwiseLCM(currentAccumulator, nextElement));
}

function processInputAndCalculate(inputLines) {
    const firstLineData = inputLines[0].split(" ");
    const upperBound = parseInt(firstLineData[1], 10);

    const numberSet = inputLines[1].split(" ").map(strValue => parseInt(strValue, 10));

    const finalLCM = computeLeastCommonMultiple(numberSet);

    let oddMultipleCount = 0;
    const halfOfLCM = finalLCM / 2;

    let currentOddMultiple = halfOfLCM;
    while (currentOddMultiple <= upperBound) {
        oddMultipleCount++;
        currentOddMultiple += finalLCM;
    }

    console.log(oddMultipleCount);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
