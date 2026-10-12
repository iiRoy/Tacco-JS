const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

const processBinaryOperations = (inputString) => {
    const inputLines = inputString.split('\n');
    const totalElements = Number(inputLines[0]);
    const binarySequence = inputLines[1].trim();

    const getSetBitCount = (numVal) => {
        let setBits = 0;
        let currentNum = numVal;
        while (currentNum > 0) {
            if ((currentNum & 1) === 1) {
                setBits++;
            }
            currentNum >>>= 1;
        }
        return setBits;
    };

    const computeStepsToZero = (currentValue) => {
        if (currentValue === 0) {
            return 0;
        }
        let iterationCount = 1;
        let tempValue = currentValue;

        while (true) {
            const bitsInTemp = getSetBitCount(tempValue);
            if (bitsInTemp === 0) {
                break;
            }
            tempValue %= bitsInTemp;
            if (tempValue === 0) {
                break;
            }
            iterationCount++;
        }
        return iterationCount;
    };

    const countOnesInString = (str) => {
        let onesCount = 0n;
        for (let char of str) {
            if (char === '1') {
                onesCount++;
            }
        }
        return onesCount;
    };

    const initialSetBitCount = countOnesInString(binarySequence);

    const divisorForOne = initialSetBitCount - 1n;
    const divisorForZero = initialSetBitCount + 1n;

    const originalBigIntValue = BigInt('0b' + binarySequence);

    for (let currentIndex = 0; currentIndex < totalElements; currentIndex++) {
        const bitPosition = BigInt(totalElements - currentIndex - 1);
        const bitToFlip = 1n << bitPosition;
        const transformedBigIntValue = originalBigIntValue ^ bitToFlip;

        if (transformedBigIntValue === 0n) {
            console.log(0);
        } else {
            const currentBitChar = binarySequence[currentIndex];
            const selectedDivisor = (currentBitChar === '1') ? divisorForOne : divisorForZero;

            const remainderValue = Number(transformedBigIntValue % selectedDivisor);
            console.log(computeStepsToZero(remainderValue) + 1);
        }
    }
};

processBinaryOperations(rawInputData);
