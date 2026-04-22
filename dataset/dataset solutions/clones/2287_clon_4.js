const computeGCD = (firstNum, secondNum) => {
    firstNum = Math.abs(firstNum);
    secondNum = Math.abs(secondNum);
    while (secondNum) {
        [firstNum, secondNum] = [secondNum, firstNum % secondNum];
    }
    return firstNum;
};

const deriveLCM = (valA, valB) => {
    if (valA === 0 || valB === 0) {
        return 0;
    }
    return (Math.abs(valA * valB)) / computeGCD(valA, valB);
};

const getPowerOfTwo = (numVal) => {
    let exponent = 0;
    while ((numVal & 1) === 0 && numVal !== 0) {
        numVal >>= 1;
        exponent++;
    }
    return exponent;
};

const processInput = (rawContent) => {
    const segments = rawContent.trim().split("\n");

    const limits = segments[0].split(" ").map(Number);
    const maximumCap = limits[1];

    const secondLineNumbers = segments[1].split(" ").map(Number);

    const uniqueSortedNumbers = Array.from(new Set(secondLineNumbers)).sort((v1, v2) => v2 - v1);

    if (uniqueSortedNumbers.length === 0) {
        return 0;
    }

    const primaryCandidate = uniqueSortedNumbers[0];
    const secondaryCandidates = uniqueSortedNumbers.slice(1);

    const primaryTwoExponent = getPowerOfTwo(primaryCandidate);
    for (const currentSecondary of secondaryCandidates) {
        if (getPowerOfTwo(currentSecondary) !== primaryTwoExponent) {
            return 0;
        }
    }

    if (secondaryCandidates.length === 0) {
        const maxP = Math.floor(maximumCap / primaryCandidate - 0.5);
        return Math.max(0, maxP);
    }

    const primaryReduced = primaryCandidate / (2 ** primaryTwoExponent);
    const secondaryReduced = secondaryCandidates.map(val => val / (2 ** getPowerOfTwo(val)));

    const commonMultipleReduced = secondaryReduced.reduce((acc, curr) => deriveLCM(acc, curr), 1);

    const requiredFactor = commonMultipleReduced / computeGCD(primaryReduced, commonMultipleReduced);

    if (requiredFactor % 2 === 0) {
        return 0;
    }

    const upperLimitForK = (2 * maximumCap) / (primaryCandidate * requiredFactor);

    const maxKValue = Math.floor(upperLimitForK);
    let totalValidK = 0;
    if (maxKValue >= 1) {
        totalValidK = Math.floor((maxKValue + 1) / 2);
    }

    return totalValidK;
};

const entryPoint = () => {
    const fileSystem = require('fs');
    const systemInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
    const finalResult = processInput(systemInput);
    console.log(finalResult);
};

entryPoint();