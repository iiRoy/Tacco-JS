'use strict'

const processSourceData = (incomingText) => {
    const extractedNumericStrings = incomingText.match(/\d+/g) || [];
    const numericComponents = extractedNumericStrings.map(Number);

    return {
        firstComponent: numericComponents[0],
        secondComponent: numericComponents[1],
        thirdComponent: numericComponents[2],
        fourthComponent: numericComponents[3]
    };
};

const evaluateComparativeStrength = (comp1, comp2, comp3, comp4) => {
    const initialInfluence = comp1 + comp2;
    const subsequentInfluence = comp3 + comp4;

    const resultDictionary = {
        '-1': 'Right',
        '0': 'Balanced',
        '1': 'Left'
    };

    const differenceSign = Math.sign(initialInfluence - subsequentInfluence);

    return resultDictionary[differenceSign];
};

const coordinateProcessing = (rawDataStream) => {
    const structuredComponents = processSourceData(rawDataStream);
    const finalJudgment = evaluateComparativeStrength(
        structuredComponents.firstComponent,
        structuredComponents.secondComponent,
        structuredComponents.thirdComponent,
        structuredComponents.fourthComponent
    );
    deliverResult(finalJudgment);
};

const deliverResult = (finalMessage) => {
    console.log(finalMessage);
};

const initiateSystem = () => {
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    coordinateProcessing(rawInputContent);
};

initiateSystem();