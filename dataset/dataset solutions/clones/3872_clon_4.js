"use strict";

const baseValue = 700;
const incrementUnit = 100;
const targetMarker = "○";

const obtainSourceContent = () => {
    const fileSystemModule = require("fs");
    const inputPath = "/dev/stdin";
    const encodingFormat = "utf8";
    return fileSystemModule.readFileSync(inputPath, encodingFormat).trim();
};

const calculateFinalSum = (charSequence) => {
    const characterCollection = Array.from(charSequence);
    
    const computedTotal = characterCollection.reduce((currentAccumulation, currentCharacter) => {
        return currentCharacter === targetMarker ? currentAccumulation + incrementUnit : currentAccumulation;
    }, baseValue);

    return computedTotal;
};

const presentOutcome = (resultValue) => {
    process.stdout.write(resultValue.toString() + "\n");
};

const executeProgram = () => {
    const receivedData = obtainSourceContent();
    const derivedResult = calculateFinalSum(receivedData);
    presentOutcome(derivedResult);
};

executeProgram();