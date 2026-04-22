const { readFileSync: retrieveContent } = require('fs');

const determineSmallestRange = (sourceElements, limitSize) => {
    const relevantElements = sourceElements.slice(0, limitSize);

    if (relevantElements.length < 2) {
        return Infinity;
    }

    return relevantElements.reduce((minimumDifference, currentElement, currentIndex, fullArray) => {
        const differencesFromCurrent = fullArray.slice(currentIndex + 1).map(nextElement => {
            return Math.abs(currentElement - nextElement);
        });

        const smallestFromCurrent = differencesFromCurrent.length > 0
            ? Math.min(...differencesFromCurrent)
            : Infinity;

        return Math.min(minimumDifference, smallestFromCurrent);
    }, Infinity);
};

const processInputData = (rawContent) => {
    const allSegments = rawContent.trim().split('\n');
    let collectionOfTasks = [];
    let currentPosition = 0;

    const accumulateTasks = (pos) => {
        if (pos >= allSegments.length) {
            return;
        }

        const quantityText = allSegments[pos];
        const numericQuantity = parseInt(quantityText, 10);

        if (numericQuantity === 0) {
            return;
        }

        const valueSequenceText = allSegments[pos + 1];
        const parsedSequence = valueSequenceText.split(' ').map(Number);

        collectionOfTasks.push({ requiredAmount: numericQuantity, dataSeries: parsedSequence });

        accumulateTasks(pos + 2);
    };

    accumulateTasks(currentPosition);
    return collectionOfTasks;
};

const executeProcessing = () => {
    const contentFromSource = retrieveContent('/dev/stdin', 'utf8');
    const structuredProblemSets = processInputData(contentFromSource);

    structuredProblemSets.forEach(task => {
        const outcome = determineSmallestRange(task.dataSeries, task.requiredAmount);
        console.log(outcome);
    });
};

executeProcessing();