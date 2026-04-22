const parseInputData = (rawText) => {
    const textLines = rawText.trim().split('\n');
    const firstSegment = textLines[0].split(' ').map(Number);
    const targetNumber = firstSegment[1]; // Corresponds to X
    const initialNumbers = textLines[1].split(' ').map(Number); // Corresponds to xi

    const combinedAndSorted = [...initialNumbers, targetNumber].sort((valA, valB) => valA - valB);
    return combinedAndSorted;
};

const reduceByDifferences = (numberCollection) => {
    if (numberCollection.length <= 1) {
        return numberCollection.length === 1 ? numberCollection[0] : 0;
    }

    const currentDifferences = [];
    for (let idx = 1; idx < numberCollection.length; idx++) {
        currentDifferences.push(numberCollection[idx] - numberCollection[idx - 1]);
    }

    const uniqueDifferences = Array.from(new Set(currentDifferences));
    uniqueDifferences.sort((valA, valB) => valA - valB);

    return reduceByDifferences(uniqueDifferences);
};

const initiateProcessing = (sourceContent) => {
    const preparedValues = parseInputData(sourceContent);
    const finalOutcome = reduceByDifferences(preparedValues);
    return finalOutcome;
};

const executeProgram = (inputPayload) => {
    const computedValue = initiateProcessing(inputPayload);
    console.log(computedValue);
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));