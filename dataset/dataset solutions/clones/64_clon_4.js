function performLargeStringAddition(operandA, operandB) {
    let maxLength = Math.max(operandA.length, operandB.length);

    if (maxLength > 80) {
        console.log("overflow");
        return;
    }

    const paddedA = operandA.padStart(maxLength, '0');
    const paddedB = operandB.padStart(maxLength, '0');

    let digitsResult = [];
    let finalCarry = 0;

    const processDigits = (idx, currentAccumulatedCarry) => {
        if (idx < 0) {
            finalCarry = currentAccumulatedCarry;
            return;
        }

        const digitValA = Number(paddedA[idx]);
        const digitValB = Number(paddedB[idx]);

        const sumOfDigits = digitValA + digitValB + currentAccumulatedCarry;
        digitsResult.unshift(sumOfDigits % 10);
        processDigits(idx - 1, Math.floor(sumOfDigits / 10));
    };

    processDigits(maxLength - 1, 0);

    let combinedDigits = '';
    if (finalCarry > 0) {
        combinedDigits = finalCarry.toString() + digitsResult.join('');
    } else {
        combinedDigits = digitsResult.join('');
    }

    if (finalCarry > 0) {
        if (maxLength === 80) {
            console.log("overflow");
        } else {
            console.log(combinedDigits);
        }
    } else {
        console.log(combinedDigits.replace(/^0+(?=\d)/, ''));
    }
}

const inputSource = global.process.stdin;

inputSource.resume();
inputSource.setEncoding('utf8');

inputSource.on('data', (incomingData) => {
    const dataLines = incomingData.trim().split("\n");
    let linePointer = 0;
    const totalOperations = Number(dataLines[linePointer++]);

    const executeOperations = (remainingOps) => {
        if (remainingOps <= 0) {
            return;
        }
        const valA = dataLines[linePointer];
        const valB = dataLines[linePointer + 1];
        linePointer += 2;
        performLargeStringAddition(valA, valB);
        executeOperations(remainingOps - 1);
    };

    executeOperations(totalOperations);
});