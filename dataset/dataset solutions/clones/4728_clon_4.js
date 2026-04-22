"use strict"

const assessParityRecursively = (valueArray, currentIndex = 0, currentOddSum = 0) => {
    if (currentIndex >= valueArray.length) {
        return currentOddSum;
    }
    const nextOddSum = currentOddSum + (valueArray[currentIndex] % 2 !== 0 ? 1 : 0);
    return assessParityRecursively(valueArray, currentIndex + 1, nextOddSum);
};

const executeProgram = (incomingData) => {
    const dataSegments = incomingData.trim().split('\n');
    const numericCollection = dataSegments[1].trim().split(' ').map(stringElement => parseInt(stringElement, 10));

    const totalOddInstances = assessParityRecursively(numericCollection);

    const resultingStatus = (totalOddInstances % 2 === 0) ? 'YES' : 'NO';
    console.log(resultingStatus);
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));