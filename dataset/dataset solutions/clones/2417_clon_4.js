"use strict";

const commFacility = require("readline").createInterface(process.stdin, process.stdout);

const fetchInputLine = () => new Promise(resolve => {
    commFacility.once("line", resolve);
});

const outputQuery = (elements) => {
    console.log("?", elements.join(" "));
};

const evaluateCyclicIndex = (baseValue, cycleLimit) => {
    const remainder = baseValue % cycleLimit;
    return (remainder === 0 ? 1 : remainder + 1);
};

const commenceProcessingUnit = async () => {
    let scaleFactorString = await fetchInputLine();
    const scaleFactor = Number(scaleFactorString);
    const doubleScale = 2 * scaleFactor;

    let initialSequence = Array.from({ length: scaleFactor }, (_, currentIdx) => currentIdx + 1);
    outputQuery(initialSequence);
    const referenceResponse = await fetchInputLine();

    let discriminantPoint = 1;
    for (let currentTest = 1; currentTest <= scaleFactor; currentTest++) {
        let modifiedSequence = [...initialSequence];
        modifiedSequence[currentTest - 1] = currentTest + scaleFactor;
        outputQuery(modifiedSequence);
        const currentTestResponse = await fetchInputLine();

        if (referenceResponse[0] !== currentTestResponse[0]) {
            discriminantPoint = currentTest;
            break;
        }
    }

    const finalPattern = new Array(doubleScale).fill('');
    const primaryComponentRegistry = new Set();
    const secondaryComponentBase = [];

    for (let componentIndex = 0; componentIndex < scaleFactor - 1; componentIndex++) {
        const primaryVal = (discriminantPoint + componentIndex) + 1;
        primaryComponentRegistry.add(primaryVal);

        const secondaryVal = evaluateCyclicIndex(primaryVal + scaleFactor, doubleScale);
        secondaryComponentBase[componentIndex] = secondaryVal;
    }

    for (let candidateValue = 1; candidateValue <= doubleScale; candidateValue++) {
        let currentQueryElements = [];

        if (primaryComponentRegistry.has(candidateValue)) {
            currentQueryElements = [...secondaryComponentBase];
            currentQueryElements[scaleFactor - 1] = candidateValue;
        } else {
            const tempPrimaryBaseElements = Array.from({ length: scaleFactor - 1 }, (_, index) =>
                (discriminantPoint + index) + 1
            );
            currentQueryElements = [...tempPrimaryBaseElements];
            currentQueryElements[scaleFactor - 1] = candidateValue;
        }

        outputQuery(currentQueryElements);
        const queryResultLine = await fetchInputLine();
        finalPattern[candidateValue - 1] = (queryResultLine[0] === "R") ? "R" : "B";
    }

    console.log("!", finalPattern.join(""));
    commFacility.close();
};

commenceProcessingUnit();