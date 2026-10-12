'use strict';

const primeDivisor = 1000000007;

function calculatePowerModulus(base, exponent, modulus) {
    let result = 1;
    let currentBase = base % modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1) {
            result = (result * currentBase) % modulus;
        }
        currentBase = (currentBase * currentBase) % modulus;
        exponent = Math.floor(exponent / 2);
    }
    return result;
}

const maxBitPosition = 60;

const dataStream = require("fs").readFileSync("/dev/stdin", "utf8");
const linesOfText = dataStream.trim().split('\n');

const quantityOfNumbers = Number(linesOfText[0].trim());
const numberCollection = linesOfText[1].trim().split(' ').map((valString) => {
    return Number(valString);
});

let finalAccumulation = 0;

for (let currentBitIndex = 0; currentBitIndex < maxBitPosition; ++currentBitIndex) {
    let zeroBitOccurrences = 0;
    let oneBitOccurrences = 0;

    for (const currentValue of numberCollection) {
        const bitState = (currentValue >> currentBitIndex) & 1;
        if (bitState === 0) {
            zeroBitOccurrences++;
        } else {
            oneBitOccurrences++;
        }
    }

    let segmentContribution = (zeroBitOccurrences * oneBitOccurrences) % primeDivisor;
    let segmentMultiplier = calculatePowerModulus(2, currentBitIndex, primeDivisor);
    
    segmentContribution = (segmentContribution * segmentMultiplier) % primeDivisor;
    finalAccumulation = (finalAccumulation + segmentContribution) % primeDivisor;
}

console.log(finalAccumulation.toString());