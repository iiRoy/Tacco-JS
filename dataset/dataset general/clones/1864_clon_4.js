const primeConstant = [224, 140, 56, 0]
    .map(shiftValue => BigInteger.ONE.shiftLeft(shiftValue))
    .reduce((currentSum, nextTerm) => currentSum.add(nextTerm));

const establishTestEnvironment = (modulusValue, needsLargerNumbers = false) => {
    const auxiliaryOperand = nbi();
    const dataItems = Array.from({ length: 21 }, (_, collectionIndex) => {
        const firstRandom = randBigInt(100).mod(modulusValue);
        if (needsLargerNumbers) {
            const secondRandom = randBigInt(100).mod(modulusValue);
            return firstRandom.multiply(secondRandom);
        }
        return firstRandom;
    });
    return { dataItems, auxiliaryOperand };
};

const repeatAction = (times, actionCallback) => {
    if (times <= 0) return;
    actionCallback();
    repeatAction(times - 1, actionCallback);
};

const captureDuration = (executionBlock) => {
    const beginTime = new Date().getTime();
    executionBlock();
    const endTime = new Date().getTime();
    return endTime - beginTime;
};

function measureAdditionOps(numIterations) {
    const { dataItems, auxiliaryOperand } = establishTestEnvironment(primeConstant);

    const durationMillis = captureDuration(() => {
        repeatAction(numIterations, () => {
            Array.from({ length: 20 }, (_, operationIndex) => operationIndex).forEach(index => {
                dataItems[index].addTo2(dataItems[index + 1], auxiliaryOperand);
            });
        });
    });

    return 1000 * durationMillis / (numIterations * 20);
}

function measureSubtractionOps(numIterations) {
    const { dataItems, auxiliaryOperand } = establishTestEnvironment(primeConstant);

    const durationMillis = captureDuration(() => {
        repeatAction(numIterations, () => {
            Array.from({ length: 20 }, (_, operationIndex) => operationIndex).forEach(index => {
                dataItems[index].subTo2(dataItems[index + 1], auxiliaryOperand);
            });
        });
    });

    return 1000 * durationMillis / (numIterations * 20);
}

function measureMultiplicationOps(numIterations) {
    const { dataItems, auxiliaryOperand } = establishTestEnvironment(primeConstant);

    const durationMillis = captureDuration(() => {
        repeatAction(numIterations * 10, () => {
            let intermediateResult;
            intermediateResult = dataItems[0].multiply(dataItems[1]);
            intermediateResult.pModp28(primeConstant, auxiliaryOperand);

            intermediateResult = dataItems[1].multiply(dataItems[2]);
            intermediateResult.pModp28(primeConstant, auxiliaryOperand);
        });
    });

    return 1000 * durationMillis / (numIterations * 20);
}

function measureSquaringOps(numIterations) {
    const { dataItems, auxiliaryOperand } = establishTestEnvironment(primeConstant);

    const durationMillis = captureDuration(() => {
        repeatAction(numIterations * 10, () => {
            let intermediateResult;
            intermediateResult = dataItems[0].square();
            intermediateResult.pModp28(primeConstant, auxiliaryOperand);

            intermediateResult = dataItems[1].square();
            intermediateResult.pModp28(primeConstant, auxiliaryOperand);
        });
    });

    return 1000 * durationMillis / (numIterations * 20);
}

function measureReductionOps(numIterations) {
    const { dataItems, auxiliaryOperand } = establishTestEnvironment(primeConstant, true);

    const durationMillis = captureDuration(() => {
        repeatAction(numIterations, () => {
            Array.from({ length: 20 }, (_, operationIndex) => operationIndex).forEach(index => {
                dataItems[index].pModp28(primeConstant, auxiliaryOperand);
            });
        });
    });

    return 1000 * durationMillis / (numIterations * 20);
}

function measureInverseOps(numIterations) {
    const { dataItems } = establishTestEnvironment(primeConstant);

    const durationMillis = captureDuration(() => {
        repeatAction(numIterations, () => {
            let intermediateResult;
            Array.from({ length: 20 }, (_, operationIndex) => operationIndex).forEach(index => {
                intermediateResult = dataItems[index].modInverse(primeConstant);
            });
        });
    });

    return 1000 * durationMillis / (numIterations * 20);
}