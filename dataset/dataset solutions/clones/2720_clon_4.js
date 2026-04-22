const inquire = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let capturedData = [];

function obtainDivisors(valueToFactor, currentDivisor = 2, divisorCollection = []) {
    if (valueToFactor === 1) {
        return divisorCollection.length === 0 ? [1] : divisorCollection;
    }

    if (currentDivisor * currentDivisor > valueToFactor && valueToFactor > 1) {
        divisorCollection.push(valueToFactor);
        return divisorCollection;
    }

    if (valueToFactor % currentDivisor === 0) {
        divisorCollection.push(currentDivisor);
        return obtainDivisors(valueToFactor / currentDivisor, currentDivisor, divisorCollection);
    } else {
        return obtainDivisors(valueToFactor, currentDivisor + 1, divisorCollection);
    }
}

function executeCalculations(inputNumber) {
    const numericalThreshold = 1000000000;
    const factorList = obtainDivisors(inputNumber);

    factorList.sort((left, right) => right - left);

    let resultingProduct = 1;
    let factorCausingExceedance = 1;

    for (const currentFactor of factorList) {
        if (resultingProduct * currentFactor < numericalThreshold) {
            resultingProduct *= currentFactor;
        } else {
            resultingProduct *= currentFactor;
            factorCausingExceedance = currentFactor;
            break;
        }
    }

    if (resultingProduct >= numericalThreshold && resultingProduct !== 1 && factorCausingExceedance !== 1) {
        resultingProduct /= factorCausingExceedance;
    }
    
    process.stdout.write("0 0 " + resultingProduct + " 0 0 " + (inputNumber / resultingProduct) + "\n");
}

inquire.on('line', (dataRow) => {
    capturedData.push(dataRow);
});

inquire.on('close', () => {
    const primaryInput = Number(capturedData[0]);
    executeCalculations(primaryInput);
});