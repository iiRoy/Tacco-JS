const acquireSourceData = () => {
    try {
        return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    } catch (issue) {
        return [];
    }
};

const createLineIterator = (sourceSegments) => {
    let currentPosition = 0;
    const totalSegments = sourceSegments.length;

    const fetchNextSegment = () => {
        if (currentPosition < totalSegments) {
            return sourceSegments[currentPosition++];
        }
        return "";
    };

    const segmentsRemain = () => currentPosition < totalSegments;

    return { fetchNextSegment, segmentsRemain };
};

const interpretLineAsNumbers = (textSegment) => {
    try {
        return textSegment.split(" ").map(Number);
    } catch (issue) {
        return [];
    }
};

const interpretLineAsInteger = (textSegment) => {
    try {
        return parseInt(textSegment, 10);
    } catch (issue) {
        return NaN;
    }
};

const presentResult = (finalValue) => {
    console.log(finalValue);
};

const logDiagnostic = (messageContent) => {
    console.error(messageContent);
};

const executeProcessing = () => {
    const rawDataStream = acquireSourceData();
    const dataNavigator = createLineIterator(rawDataStream);

    const initialQuantities = interpretLineAsNumbers(dataNavigator.fetchNextSegment());
    const countAlpha = initialQuantities[0];
    const countBeta = initialQuantities[1];

    const collectionAlpha = interpretLineAsNumbers(dataNavigator.fetchNextSegment());
    const collectionBeta = interpretLineAsNumbers(dataNavigator.fetchNextSegment());
    const collectionGamma = interpretLineAsNumbers(dataNavigator.fetchNextSegment());

    const sortedAlpha = [...collectionAlpha].sort((itemA, itemB) => itemB - itemA);
    const sortedBeta = [...collectionBeta].sort((itemA, itemB) => itemB - itemA);

    const combinedSelection = [
        ...sortedAlpha.slice(0, countAlpha),
        ...sortedBeta.slice(0, countBeta),
        ...collectionGamma
    ];

    const finalSortedCombined = combinedSelection.sort((itemA, itemB) => itemB - itemA);

    const elementsToSum = countAlpha + countBeta;
    const computedTotal = finalSortedCombined
        .slice(0, elementsToSum)
        .reduce((accumulated, current) => accumulated + current, 0);

    presentResult(computedTotal);
};

executeProcessing();