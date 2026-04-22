const findGreatestCommonDivisor = (valA, valB) => {
    let tempHolder;
    while (valB !== 0) {
        tempHolder = valB;
        valB = valA % valB;
        valA = tempHolder;
    }
    return valA;
};

const calculateLeastCommonMultiple = (numericCollection) => {
    if (numericCollection.length === 0) {
        return 0; 
    }
    if (numericCollection.length === 1) {
        return numericCollection[0];
    }

    let currentLcmAccumulator = numericCollection[0];
    for (let index = 1; index < numericCollection.length; index++) {
        const currentNumericalValue = numericCollection[index];
        const commonDivisor = findGreatestCommonDivisor(currentLcmAccumulator, currentNumericalValue);
        currentLcmAccumulator = (currentLcmAccumulator * currentNumericalValue) / commonDivisor;
    }
    return currentLcmAccumulator;
};

const processInputData = (incomingText) => {
    const parsedNumericElements = incomingText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(valueString => Number(valueString));

    const countIndicator = parsedNumericElements.shift();
    const payloadNumbers = parsedNumericElements;

    if (countIndicator === 1) {
        return Math.max(...payloadNumbers);
    } else {
        return calculateLeastCommonMultiple(payloadNumbers);
    }
};