"use strict"
const combineVectors = (vecA, vecB) => {
    const resultVec = new Array(vecA.length);
    for (let k = 0; k < vecA.length; k++) {
        resultVec[k] = vecA[k] ^ vecB[k];
    }
    return resultVec;
};

const calculatePowerMod = (base, exponent, modulus) => {
    let result = 1;
    base %= modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1) result = (result * base) % modulus;
        base = (base * base) % modulus;
        exponent = Math.floor(exponent / 2);
    }
    return result;
};

const processInputAndCalculate = (rawData) => {
    const parsedData = rawData.trim().split(/\s+/).map(Number);
    const rowCount = parsedData.shift();
    const colCount = parsedData.shift();

    const initialMatrixRows = [];
    for (let i = 0; i < rowCount; i++) {
        initialMatrixRows.push(parsedData.slice(i * colCount, (i + 1) * colCount));
    }

    const basisVectorsMap = new Map();
    let currentRankValue = 0;

    for (let r = 0; r < rowCount; r++) {
        let currentVector = [...initialMatrixRows[r]];

        for (let j = 0; j < colCount; j++) {
            if (currentVector[j] === 1) {
                if (basisVectorsMap.has(j)) {
                    currentVector = combineVectors(currentVector, basisVectorsMap.get(j));
                }
            }
        }

        let pivotColumnForNewVector = -1;
        for (let j = 0; j < colCount; j++) {
            if (currentVector[j] === 1) {
                pivotColumnForNewVector = j;
                break;
            }
        }

        if (pivotColumnForNewVector !== -1) {
            for (const [existingPivotCol, existingVector] of basisVectorsMap.entries()) {
                if (existingVector[pivotColumnForNewVector] === 1) {
                    basisVectorsMap.set(existingPivotCol, combineVectors(existingVector, currentVector));
                }
            }
            basisVectorsMap.set(pivotColumnForNewVector, currentVector);
            currentRankValue++;
        }
    }

    const finalRank = currentRankValue;

    const modulusValue = 998244353;

    const exponentOne = rowCount + colCount - 1;
    const termResultOne = calculatePowerMod(2, exponentOne, modulusValue);

    const exponentTwo = rowCount + colCount - finalRank - 1;
    const termResultTwo = calculatePowerMod(2, exponentTwo, modulusValue);

    let finalAnswer = (termResultOne - termResultTwo + modulusValue) % modulusValue;

    console.log(finalAnswer);
};

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
