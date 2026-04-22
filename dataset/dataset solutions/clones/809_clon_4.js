const printToConsole = console.log;

if (typeof executionEnvironment !== "undefined") {
    let receivedContent = "";
    executionEnvironment.stdin.resume();
    executionEnvironment.stdin.setEncoding('utf8');
    executionEnvironment.stdin.on('data', (dataChunk) => {
        receivedContent += dataChunk;
    });
    executionEnvironment.stdin.on('end', () => {
        preprocessAndInitiate(receivedContent);
    });
}

const extractNumericalSequence = (lineText) => lineText.split(' ').map(Number);

const deriveSuccessiveDifferences = (sequenceInput) =>
    sequenceInput.slice(1).map((currentValue, previousIndex) => currentValue - sequenceInput[previousIndex]);

const processDataPair = ([descriptorArray, valueArray]) => {
    const removalThreshold = descriptorArray[1];
    const computedDifferences = deriveSuccessiveDifferences(valueArray);
    
    computedDifferences.sort((firstElement, secondElement) => secondElement - firstElement);

    const remainingDifferences = computedDifferences.slice(removalThreshold - 1);

    if (remainingDifferences.length === 0) {
        return 0;
    } else {
        return remainingDifferences.reduce((accumulatorValue, currentDifference) => accumulatorValue + currentDifference, 0);
    }
};

function coreLogicHandler(initialContentUnits) {
    const numericalUnitArrays = initialContentUnits.slice(1).map(extractNumericalSequence);

    const pairedDataCollections = numericalUnitArrays.reduce((accumulatedPairs, currentUnit, currentIndex) => {
        if (currentIndex % 2 === 0) {
            if (numericalUnitArrays[currentIndex + 1]) {
                accumulatedPairs.push([currentUnit, numericalUnitArrays[currentIndex + 1]]);
            }
        }
        return accumulatedPairs;
    }, []);

    pairedDataCollections.forEach(dataPair => {
        printToConsole(processDataPair(dataPair));
    });
}

function preprocessAndInitiate(rawContent) {
    const segmentedContent = rawContent.split("\n");
    const trimmedContent = segmentedContent.slice(1, -1);
    coreLogicHandler(trimmedContent);
}