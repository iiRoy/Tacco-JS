'use strict';

const parseInputData = (rawInputString) => {
    const trimmedLines = rawInputString.trim().split(/\n/);
    const firstLine = trimmedLines.shift();
    const numMen = parseInt(firstLine, 10);
    const compatibilityData = trimmedLines.map(line => line.split(/\s+/).map(val => parseInt(val, 10)));
    return { numMen, compatibilityData };
};

const calculatePopCount = (maskValue) => {
    let count = 0;
    let tempMask = maskValue;
    while (tempMask > 0) {
        count += (tempMask & 1);
        tempMask >>= 1;
    }
    return count;
};

const addWithModulus = (valA, valB, mod) => {
    return (valA + valB) % mod;
};

(function(rawInputString){
    const { numMen, compatibilityData } = parseInputData(rawInputString);

    const maxMaskValue = Math.pow(2, numMen);
    const modulus = Math.pow(10, 9) + 7;

    const compatibilityMatrix = compatibilityData;

    const masksByPopCount = new Array(numMen).fill(null).map(() => ({}));

    for (let currentMask = 1; currentMask < maxMaskValue; currentMask++) {
        const bitCount = calculatePopCount(currentMask);
        if (bitCount > 0 && bitCount <= numMen) {
            masksByPopCount[bitCount - 1][currentMask] = currentMask;
        }
    }

    const memoTable = new Array(numMen).fill(null).map(() => ({}));

    const baseCaseRow = new Array(maxMaskValue).fill(1);

    const getMemoValue = (manIndex, womenMask) => {
        if (manIndex < 0) {
            return baseCaseRow[womenMask] || 0;
        }
        return memoTable[manIndex][womenMask] || 0;
    };

    for (let currentManIdx = 0; currentManIdx < numMen; currentManIdx++) {
        const relevantWomenMasks = masksByPopCount[currentManIdx];

        for (const womenMaskStr in relevantWomenMasks) {
            const womenMask = parseInt(womenMaskStr, 10);

            if (memoTable[currentManIdx][womenMask] === undefined) {
                memoTable[currentManIdx][womenMask] = 0;
            }

            for (let potentialWomanIdx = 0; potentialWomanIdx < numMen; potentialWomanIdx++) {
                const womanBit = 1 << potentialWomanIdx;

                if (compatibilityMatrix[currentManIdx][potentialWomanIdx] === 0) {
                    continue;
                }
                if ((womenMask & womanBit) === 0) {
                    continue;
                }

                const previousWomenMask = womenMask ^ womanBit;
                const previousManIdx = currentManIdx - 1;

                const valueFromPreviousState = getMemoValue(previousManIdx, previousWomenMask);

                memoTable[currentManIdx][womenMask] = addWithModulus(
                    memoTable[currentManIdx][womenMask],
                    valueFromPreviousState,
                    modulus
                );
            }
        }
    }

    const finalResult = getMemoValue(numMen - 1, maxMaskValue - 1);
    console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));
