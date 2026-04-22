"use strict";

class DataStreamProcessor {
    constructor(sourceData) {
        this.dataTokens = sourceData.split(/ |\n/).filter(segment => segment !== '');
        this.currentTokenIndex = 0;
    }

    retrieveNumericToken() {
        return Number(this.dataTokens[this.currentTokenIndex++]);
    }

    retrieveStringToken() {
        return this.dataTokens[this.currentTokenIndex++];
    }
}

function calculatePopulationCount(numericValue) {
    if (numericValue === 0) return 0;
    let count = 0;
    let tempValue = numericValue;
    while (tempValue > 0) {
        tempValue &= (tempValue - 1);
        count++;
    }
    return count;
}

function determineReductionSequenceLength(initialValue) {
    if (initialValue === 0) return 1;
    let currentValue = initialValue;
    let stepsTaken = 1;
    while (true) {
        currentValue %= calculatePopulationCount(currentValue);
        if (currentValue === 0) break;
        stepsTaken++;
    }
    return stepsTaken;
}

function convertBinaryStringToModuloValue(binaryString, modulusDivisor) {
    return binaryString.split('').reduce((accumulator, digitChar) => {
        return (accumulator * 2 + (digitChar === '1' ? 1 : 0)) % modulusDivisor;
    }, 0);
}

function processBitChangeScenarios(binarySourceString, stringLength, modulusDivisor, performSubtraction) {
    const baseValueModulo = convertBinaryStringToModuloValue(binarySourceString, modulusDivisor);
    const outcomeArray = new Array(stringLength).fill(0);

    let currentPowerOfTwoFactor = performSubtraction ? (modulusDivisor - 1) : 1;

    for (let index = stringLength - 1; index >= 0; index--) {
        const currentBit = Number(binarySourceString[index]);

        let conditionMet = false;
        if (performSubtraction && currentBit === 1) {
            conditionMet = true;
        } else if (!performSubtraction && currentBit === 0) {
            conditionMet = true;
        }

        if (conditionMet) {
            const transformedValue = (baseValueModulo + currentPowerOfTwoFactor) % modulusDivisor;
            outcomeArray[index] = determineReductionSequenceLength(transformedValue);
        }
        currentPowerOfTwoFactor = (currentPowerOfTwoFactor * 2) % modulusDivisor;
    }
    return outcomeArray;
}

function orchestratePrimaryComputation() {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const inputParser = new DataStreamProcessor(fileContent);

    const sequenceLength = inputParser.retrieveNumericToken();
    const binaryInputSequence = inputParser.retrieveStringToken();

    const numberOfOnes = binaryInputSequence.split('').filter(character => character === '1').length;
    const primaryModuloDivisor = 1 + numberOfOnes;
    const secondaryModuloDivisor = primaryModuloDivisor - 2;

    const finalOutputResults = new Array(sequenceLength).fill(0);

    const resultsForZeroFlips = processBitChangeScenarios(binaryInputSequence, sequenceLength, primaryModuloDivisor, false);
    for (let i = 0; i < sequenceLength; i++) {
        if (Number(binaryInputSequence[i]) === 0) {
            finalOutputResults[i] = resultsForZeroFlips[i];
        }
    }

    if (secondaryModuloDivisor < 1) {
        return finalOutputResults.join("\n");
    }

    const resultsForOneFlips = processBitChangeScenarios(binaryInputSequence, sequenceLength, secondaryModuloDivisor, true);
    for (let i = 0; i < sequenceLength; i++) {
        if (Number(binaryInputSequence[i]) === 1) {
            finalOutputResults[i] = resultsForOneFlips[i];
        }
    }

    return finalOutputResults.join("\n");
}

const computationResult = orchestratePrimaryComputation();
if (computationResult !== undefined) {
    console.log(String(computationResult));
}