var incomingTextLines = [];

var dataInputCursor;

function establishInputReader(rawLines) {
    let currentPosition = 0;
    const storedInputSegments = rawLines;

    const advanceAndRetrieve = () => {
        if (currentPosition >= storedInputSegments.length) {
            throw new Error("No more records to process!");
        }
        const currentRecord = storedInputSegments[currentPosition];
        currentPosition++;
        return currentRecord;
    };

    return { advanceAndRetrieve };
}

function extractNumericArray(textualEntry) {
    return textualEntry.split(' ').map(Number);
}

function presentFinalOutput(contentToDisplay) {
    if (Array.isArray(contentToDisplay)) {
        console.log(contentToDisplay.join(' '));
    } else {
        console.log(contentToDisplay);
    }
}

function executeCoreLogic() {
    const receivedParameters = extractNumericArray(dataInputCursor.advanceAndRetrieve());

    const paramA = receivedParameters[0];
    const paramB = receivedParameters[1];

    if (paramB === 0) {
        const upperLimitForIteration = 1 << paramA;

        const resultantCollection = Array.from({ length: upperLimitForIteration }, (_, elementIndex) => [elementIndex, elementIndex])
                                           .reduce((accumulatedList, pair) => accumulatedList.concat(pair), []);

        presentFinalOutput(resultantCollection);
    } else {
        presentFinalOutput(-1);
    }
}