const sourceAccessor = require('fs').readFileSync;
const rawDataSource = sourceAccessor('/dev/stdin', 'utf8');

const parseLineData = (lineContent) => {
    const numericValues = lineContent.split(" ").map(Number);
    return {
        initialLoad: numericValues[0],
        lowerBound: numericValues[1],
        upperBound: numericValues[2]
    };
};

const processDataSetsRecursively = (remainingInputLines) => {
    if (remainingInputLines.length === 0) {
        return;
    }

    const currentCountLine = remainingInputLines.shift();
    const entryCount = Number(currentCountLine);

    if (entryCount === 0) {
        return;
    }

    const currentBlockElements = [];
    for (let currentElementIndex = 0; currentElementIndex < entryCount; currentElementIndex++) {
        currentBlockElements.push(parseLineData(remainingInputLines.shift()));
    }

    const checkIntervalIntersection = (firstElement, secondElement) => {
        return firstElement.lowerBound <= secondElement.upperBound && firstElement.upperBound >= secondElement.lowerBound;
    };

    const blockVerificationResult = currentBlockElements.some(mainElement => {
        let accumulatedLoad = mainElement.initialLoad;

        const contributingLoads = currentBlockElements
            .filter(secondaryElement => secondaryElement !== mainElement && checkIntervalIntersection(mainElement, secondaryElement))
            .map(intersectingElement => intersectingElement.initialLoad);

        accumulatedLoad += contributingLoads.reduce((total, loadValue) => total + loadValue, 0);

        return accumulatedLoad > 150;
    }) ? "NG" : "OK";

    console.log(blockVerificationResult);

    processDataSetsRecursively(remainingInputLines);
};

const allInputLinesStripped = rawDataSource.trim().split("\n");

processDataSetsRecursively(allInputLinesStripped);