const { readSync, openSync, closeSync } = require('fs');

const obtainStreamContent = (resourcePath) => {
    let fileDescriptor;
    let collectedBuffer = Buffer.alloc(1024);
    let accumulatedLength = 0;
    let bytesReadSegment;

    try {
        fileDescriptor = openSync(resourcePath, 'r');
        while (true) {
            bytesReadSegment = readSync(fileDescriptor, collectedBuffer, accumulatedLength, collectedBuffer.length - accumulatedLength, null);
            if (bytesReadSegment === 0) break;
            accumulatedLength += bytesReadSegment;
            if (accumulatedLength === collectedBuffer.length) {
                const expandedBuffer = Buffer.alloc(collectedBuffer.length * 2);
                collectedBuffer.copy(expandedBuffer, 0, 0, accumulatedLength);
                collectedBuffer = expandedBuffer;
            }
        }
    } finally {
        if (fileDescriptor !== undefined) {
            closeSync(fileDescriptor);
        }
    }
    return collectedBuffer.toString('utf8', 0, accumulatedLength);
};

const processInputToNumber = (rawText) => {
    const purifiedText = rawText.replace(/^\s+|\s+$/g, '');
    return +purifiedText;
};

const computeIntegralPowers = (baseValue, exponentValue) => {
    if (exponentValue === 0) return 1;
    if (exponentValue === 1) return baseValue;
    let currentProduct = 1;
    for (let counter = 0; counter < exponentValue; counter++) {
        currentProduct *= baseValue;
    }
    return currentProduct;
};

const calculateSeriesSum = (numericOperand) => {
    const termOne = computeIntegralPowers(numericOperand, 1);
    const termTwo = computeIntegralPowers(numericOperand, 2);
    const termThree = computeIntegralPowers(numericOperand, 3);
    return termOne + termTwo + termThree;
};

const applicationEntry = () => {
    const acquiredString = obtainStreamContent('/dev/stdin');
    const processedNumber = processInputToNumber(acquiredString);
    const finalSum = calculateSeriesSum(processedNumber);
    process.stdout.write(String(finalSum) + '\n');
};

applicationEntry();