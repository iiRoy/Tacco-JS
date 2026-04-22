"use strict";

const MAX_MAGNITUDE_THRESHOLD = 1e18;

const RESULT_TRANSFORMER = {
    'true': 1,
    'false': -1
};

const dataProcessor = (inputContent) => {
    let cleanedContent = inputContent.trim();

    let extractedSegments = cleanedContent.match(/^(\d+)\n(\d+)\n(?:.*)\n(?:.*)(.)$/s);

    if (!extractedSegments) {
        throw new Error("Input data structure is not as expected.");
    }

    let numberOne = +extractedSegments[1];
    let numberTwo = +extractedSegments[2];
    let finalCharacter = extractedSegments[3];

    let calculatedDifference = numberOne - numberTwo;

    let parityIndicator = +finalCharacter;

    let absoluteDifference = (calculatedDifference < 0) ? -calculatedDifference : calculatedDifference;

    if (absoluteDifference > MAX_MAGNITUDE_THRESHOLD) {
        return "Unfair";
    } else {
        let conditionMetForPositive = (parityIndicator % 2 === 0 || calculatedDifference === 0);

        let multiplier = RESULT_TRANSFORMER[String(conditionMetForPositive)];

        return calculatedDifference * multiplier;
    }
};

const computationRunner = (resourcePath) => {
    let fileContents = require("fs").readFileSync(resourcePath, "utf8");
    return dataProcessor(fileContents);
};

console.log(computationRunner("/dev/stdin"));