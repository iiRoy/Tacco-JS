const parseNumericLine = (textLine) => textLine.split(" ").map(Number);

const calculateAdjacentDifferences = (numCollection) =>
    numCollection.slice(0, -1).map((val, idx) => numCollection[idx + 1] - val);

const anomalyResolutionSchemes = [
    {
        nameIdentifier: "trailingSequenceMismatch",
        conditionEvaluator: (deltaArray, valueSet) => {
            if (deltaArray.length < 4) return false;
            return deltaArray[0] === deltaArray[1] && deltaArray[1] === deltaArray[2] && deltaArray[2] === deltaArray[3];
        },
        consequenceDeterminer: (deltaArray, valueSet) => {
            const commonIncrement = deltaArray[0];
            const checkStartingPoint = 4;
            const deviatingDeltaIndex = deltaArray.findIndex((d, currentIdx) => currentIdx >= checkStartingPoint && d !== commonIncrement);
            return deviatingDeltaIndex !== -1 ? valueSet[deviatingDeltaIndex + 1] : null;
        }
    },
    {
        nameIdentifier: "initialElementDeviation",
        conditionEvaluator: (deltaArray, valueSet) => {
            if (deltaArray.length < 4) return false;
            return deltaArray[1] === deltaArray[2] && deltaArray[2] === deltaArray[3];
        },
        consequenceDeterminer: (deltaArray, valueSet) => valueSet[0]
    },
    {
        nameIdentifier: "fifthElementOutlier",
        conditionEvaluator: (deltaArray, valueSet) => {
            if (deltaArray.length < 3) return false;
            return deltaArray[0] === deltaArray[1] && deltaArray[1] === deltaArray[2];
        },
        consequenceDeterminer: (deltaArray, valueSet) => valueSet[4]
    },
    {
        nameIdentifier: "secondElementMisplacement",
        conditionEvaluator: (deltaArray, valueSet) => {
            if (deltaArray.length < 4 || valueSet.length < 1) return false;
            return (deltaArray[1] - valueSet[0]) === deltaArray[2] && deltaArray[2] === deltaArray[3];
        },
        consequenceDeterminer: (deltaArray, valueSet) => valueSet[1]
    },
    {
        nameIdentifier: "fourthElementDiscrepancy",
        conditionEvaluator: (deltaArray, valueSet) => {
            if (deltaArray.length < 2 || valueSet.length < 5) return false;
            return deltaArray[0] === deltaArray[1] && deltaArray[1] === (valueSet[4] - valueSet[2]);
        },
        consequenceDeterminer: (deltaArray, valueSet) => valueSet[3]
    },
    {
        nameIdentifier: "thirdElementAnomaly",
        conditionEvaluator: (deltaArray, valueSet) => {
            if (deltaArray.length < 4 || valueSet.length < 4) return false;
            return deltaArray[0] === (valueSet[3] - valueSet[1]) && deltaArray[0] === deltaArray[3];
        },
        consequenceDeterminer: (deltaArray, valueSet) => valueSet[2]
    }
];

const locateDivergentValue = (valueCollection, ruleSet) => {
    const valueDeltas = calculateAdjacentDifferences(valueCollection);
    for (const ruleDefinition of ruleSet) {
        if (ruleDefinition.conditionEvaluator(valueDeltas, valueCollection)) {
            const detectedAnomaly = ruleDefinition.consequenceDeterminer(valueDeltas, valueCollection);
            if (detectedAnomaly !== null) {
                return detectedAnomaly;
            }
        }
    }
    return null;
};

function* dataBlockExtractor(rawTextSegments) {
    let currentPosition = 0;
    while (currentPosition < rawTextSegments.length) {
        const elementCountStr = rawTextSegments[currentPosition];
        const elementCount = Number(elementCountStr);
        if (elementCount === 0) {
            break;
        }
        currentPosition++;
        const dataSequenceLine = rawTextSegments[currentPosition];
        currentPosition++;
        yield { quantity: elementCount, dataLine: dataSequenceLine };
    }
}

const inputSource = process.stdin;
inputSource.resume();
inputSource.setEncoding('utf8');

inputSource.on('data', (receivedPayload) => {
    const inputSegmentations = receivedPayload.trim().split("\n");

    const processedOutputs = [];
    for (const dataUnit of dataBlockExtractor(inputSegmentations)) {
        const numericValues = parseNumericLine(dataUnit.dataLine);
        const identifiedMismatch = locateDivergentValue(numericValues, anomalyResolutionSchemes);
        if (identifiedMismatch !== null) {
            processedOutputs.push(identifiedMismatch);
        }
    }
    processedOutputs.forEach(value => console.log(value));
});