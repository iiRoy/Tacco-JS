const sourceReader = require('fs').readFileSync('/dev/stdin', 'utf8');
const allInputLines = sourceReader.replace(/\n$/, "").split("\n");

function* lineProducer(linesCollection) {
    let currentLineIndex = 0;
    while (currentLineIndex < linesCollection.length) {
        yield linesCollection[currentLineIndex++];
    }
}

const inputLineIterator = lineProducer(allInputLines);

const transformEntryData = (rawEntryString, sequenceIndex) => {
    const entrySegments = rawEntryString.split(" ");
    const entryIdentifier = entrySegments.shift();
    const numericalParameters = entrySegments.map(Number);

    // Corresponds to (L, P, A, B, C, D, E, F, S, M) in original IIFE
    const [
        paramP, paramA, paramB, paramC, paramD, paramE, paramF, paramS, paramM
    ] = numericalParameters;

    const computedDuration = paramA + paramB + paramC + ((paramD + paramE) * paramM);
    const generatedRevenue = (paramF * paramS * paramM) - paramP;

    return {
        labelKey: entryIdentifier,
        performanceMetric: generatedRevenue / computedDuration,
        initialPosition: sequenceIndex
    };
};

const processDataBlocksRecursively = (dataIterator) => {
    const nextLineResult = dataIterator.next();
    if (nextLineResult.done) {
        return; // No more input
    }

    const blockItemCount = Number(nextLineResult.value);
    if (blockItemCount === 0) {
        return; // Termination condition for the entire input
    }

    const currentBlockProcessedItems = Array.from({ length: blockItemCount }, (_, itemIndex) => {
        const itemLine = dataIterator.next().value;
        return transformEntryData(itemLine, itemIndex);
    });

    currentBlockProcessedItems.sort((itemOne, itemTwo) => {
        if (itemOne.performanceMetric === itemTwo.performanceMetric) {
            return itemOne.initialPosition - itemTwo.initialPosition;
        }
        return itemTwo.performanceMetric - itemOne.performanceMetric;
    });

    currentBlockProcessedItems.forEach(processedItem => console.log(processedItem.labelKey));
    console.log("#");

    processDataBlocksRecursively(dataIterator); // Recurse for the next block
};

processDataBlocksRecursively(inputLineIterator);
