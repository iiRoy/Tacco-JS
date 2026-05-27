"use strict";

const InputHandler = (function() {
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    const tokenStream = rawInputData.split(/ |\n/);
    let tokenPointer = 0;

    function readInteger() {
        return +tokenStream[tokenPointer++];
    }

    function readToken() {
        return tokenStream[tokenPointer++];
    }

    function readBigInteger() {
        return BigInt(tokenStream[tokenPointer++]);
    }

    function initializeMultiDimensionalArray(initialValue) {
        const args = arguments;
        const argCount = args.length;
        let arrayCreationString = "Array(args[" + (argCount - 1) + "]).fill().map(x=>{return " + initialValue + ";})";
        for (let i = argCount - 2; i >= 1; i--) {
            arrayCreationString = "Array(args[" + i + "]).fill().map(x=>" + arrayCreationString + ")";
        }
        return eval(arrayCreationString);
    }

    return {
        readInteger,
        readToken,
        readBigInteger,
        initializeMultiDimensionalArray
    };
})();

function countSetBitsPopcount(value) {
    value = (value & 0x55555555) + ((value >> 1) & 0x55555555);
    value = (value & 0x33333333) + ((value >> 2) & 0x33333333);
    value = (value & 0x0f0f0f0f) + ((value >> 4) & 0x0f0f0f0f);
    value = (value & 0x00ff00ff) + ((value >> 8) & 0x00ff00ff);
    return (value & 0x0000ffff) + ((value >> 16) & 0x0000ffff);
}

function calculateInitialModulus(binarySequence, sequenceLength) {
    let oneCount = 0;
    for (let i = 0; i < sequenceLength; i++) {
        if (binarySequence[i] === "1") {
            oneCount++;
        }
    }
    return oneCount + 1;
}

function computeBinaryStringValueModulo(binarySequence, sequenceLength, modulus) {
    let currentModuloValue = 0;
    for (let i = 0; i < sequenceLength; i++) {
        currentModuloValue = (currentModuloValue * 2 + parseInt(binarySequence[i], 10)) % modulus;
    }
    return currentModuloValue;
}

function resolveModuloChain(initialValue, bitCounterFunc) {
    let steps = 0;
    let tempValue = initialValue;
    while (tempValue !== 0) {
        tempValue %= bitCounterFunc(tempValue);
        steps++;
    }
    return steps;
}

function solveProblem() {
    const sequenceLength = InputHandler.readInteger();
    const binaryString = InputHandler.readToken();

    if (sequenceLength <= 0) {
        return "";
    }

    const modulusForZeros = calculateInitialModulus(binaryString, sequenceLength);

    const outputResults = InputHandler.initializeMultiDimensionalArray(0, sequenceLength);

    let initialRemainderForZeros = computeBinaryStringValueModulo(binaryString, sequenceLength, modulusForZeros);

    let currentPowerModulus = 1;

    for (let i = sequenceLength - 1; i >= 0; i--) {
        if (binaryString[i] === "0") {
            const combinedValue = (initialRemainderForZeros + currentPowerModulus) % modulusForZeros;
            outputResults[i] = resolveModuloChain(combinedValue, countSetBitsPopcount) + 1;
        }
        currentPowerModulus = (currentPowerModulus * 2) % modulusForZeros;
    }

    const modulusForOnes = modulusForZeros - 2;

    if (modulusForOnes < 1) {
        return outputResults.join("\n");
    }

    let initialRemainderForOnes = computeBinaryStringValueModulo(binaryString, sequenceLength, modulusForOnes);

    currentPowerModulus = 1;

    for (let i = sequenceLength - 1; i >= 0; i--) {
        if (binaryString[i] === "1") {
            const combinedValue = (initialRemainderForOnes + currentPowerModulus) % modulusForOnes;
            outputResults[i] = resolveModuloChain(combinedValue, countSetBitsPopcount) + 1;
        }
        currentPowerModulus = (currentPowerModulus * 2) % modulusForOnes;
    }

    return outputResults.join("\n");
}

const finalOutput = solveProblem();
if (finalOutput !== undefined) {
    console.log(String(finalOutput));
}
