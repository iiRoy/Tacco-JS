function computeGCD(valA, valB) {
    let maxVal = Math.max(valA, valB);
    let minVal = Math.min(valA, valB);
    while (minVal !== 0) {
        let tempMinVal = minVal;
        minVal = maxVal % minVal;
        maxVal = tempMinVal;
    }
    return maxVal;
}

function computeLCM(valA, valB) {
    if (valA === 0 || valB === 0) {
        return 0;
    }
    return Math.abs(valA * valB) / computeGCD(valA, valB);
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLinesArray = rawInputData.trim().split('\n');
let linePointer = 0;

while (true) {
    const currentSetSize = parseInt(inputLinesArray[linePointer++], 10);
    if (currentSetSize === 0) {
        break;
    }

    let fractionList = [];
    for (let loopIdx = 0; loopIdx < currentSetSize; loopIdx++) {
        const pairString = inputLinesArray[linePointer++];
        const [numA, numB] = pairString.split(' ').map(Number);
        const pairGCD = computeGCD(numA, numB);
        fractionList.push([numA / pairGCD, numB / pairGCD]);
    }

    let commonDenominator = 1;
    for (const fractionEntry of fractionList) {
        const currentDenominator = fractionEntry[1];
        commonDenominator = computeLCM(currentDenominator, commonDenominator);
    }

    const scaledNumeratorList = fractionList.map(currentFraction => {
        const numeratorPart = currentFraction[0];
        const denominatorPart = currentFraction[1];
        return numeratorPart * (commonDenominator / denominatorPart);
    });

    let finalCommonMultiple = 1;
    for (const numeratorValue of scaledNumeratorList) {
        finalCommonMultiple = computeLCM(numeratorValue, finalCommonMultiple);
    }

    for (const outputNumerator of scaledNumeratorList) {
        console.log(finalCommonMultiple / outputNumerator);
    }
}
