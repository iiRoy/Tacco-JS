const systemIO = require('fs');

function obtainInputData() {
    return systemIO.readFileSync('/dev/stdin', 'utf8');
}

function provideOutputData(processedText) {
    systemIO.appendFileSync('/dev/stdout', processedText, 'utf8');
}

function calculateXorPrefixSum(upperBound) {
    const zeroVal = 0n;
    const oneVal = 1n;
    const twoVal = 2n;
    const threeVal = 3n;
    const fourVal = 4n;

    const remainderOfDivision = upperBound % fourVal;
    if (remainderOfDivision === zeroVal) {
        return upperBound;
    } else if (remainderOfDivision === oneVal) {
        return oneVal;
    } else if (remainderOfDivision === twoVal) {
        return upperBound + oneVal;
    } else {
        return zeroVal;
    }
}

function solveChallenge() {
    const rawInput = obtainInputData();
    const cleanedInput = rawInput.trim();
    const numberStrings = cleanedInput.split(" ");

    const firstNum = BigInt(numberStrings[0]);
    const secondNum = BigInt(numberStrings[1]);

    const xorSumTillSecond = calculateXorPrefixSum(secondNum);
    const xorSumTillFirstMinusOne = calculateXorPrefixSum(firstNum - 1n);

    const finalResult = xorSumTillSecond ^ xorSumTillFirstMinusOne;

    provideOutputData(finalResult.toString() + '\n');
}

solveChallenge();