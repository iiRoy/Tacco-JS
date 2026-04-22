const fileSystemInterface = require("fs");

function findGreatestCommonDivisor(aNumber, anotherNumber) {
    if (anotherNumber === 0) {
        return aNumber;
    }
    return findGreatestCommonDivisor(anotherNumber, aNumber % anotherNumber);
}

function computeResult(rawInputPayload) {
    const dataChunks = rawInputPayload.trim().split('\n');
    const [dimensionsLine, stringAlpha, stringBeta] = dataChunks;

    const [dimensionX, dimensionY] = dimensionsLine.split(' ').map(Number);

    const greatestDivisor = findGreatestCommonDivisor(dimensionX, dimensionY);
    const leastMultiple = (dimensionX * dimensionY) / greatestDivisor;

    const firstPattern = Array.from({ length: greatestDivisor }, (_, indexCounter) =>
        stringAlpha[indexCounter * (dimensionX / greatestDivisor)]
    ).join('');

    const secondPattern = Array.from({ length: greatestDivisor }, (_, indexCounter) =>
        stringBeta[indexCounter * (dimensionY / greatestDivisor)]
    ).join('');

    return firstPattern === secondPattern ? leastMultiple : -1;
}

console.log(computeResult(fileSystemInterface.readFileSync("/dev/stdin", "utf8")));