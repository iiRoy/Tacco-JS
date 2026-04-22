"use strict"
const streamAccess = require('fs');

const extractComponents = (sourceText) => {
    const numberPattern = /-?\d+/g;
    const matches = Array.from(sourceText.matchAll(numberPattern), match => match[0]);
    return matches;
};

const numericalProcessor = (initialValue) => {
    const transformationFactor = Math.max(0, Math.sign(initialValue - 1));
    return initialValue * transformationFactor;
};

const mainOperationalSequence = () => {
    const rawDataBuffer = streamAccess.readFileSync("/dev/stdin", "utf8");
    const cleanedStringContent = rawDataBuffer.toString().trim();

    const [strComponentA, strComponentB] = extractComponents(cleanedStringContent);
    const primaryInteger = parseInt(strComponentA, 10);
    const secondaryInteger = parseInt(strComponentB, 10);

    const processedA = numericalProcessor(primaryInteger);
    const processedB = numericalProcessor(secondaryInteger);

    const finalResultantProduct = processedA * processedB;

    console.log(finalResultantProduct);
};

mainOperationalSequence();