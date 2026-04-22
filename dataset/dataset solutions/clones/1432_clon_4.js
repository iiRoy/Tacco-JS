const processInput = (textSegments) => {
    const inputString = textSegments.join('');
    const allLines = inputString.split('\n');

    if (allLines.length === 0) {
        console.log(0);
        return;
    }

    const searchKey = allLines[0];
    const remainingSegments = allLines.slice(1);

    if (remainingSegments.length === 0) {
        console.log(0);
        return;
    }

    const occurrenceCounter = remainingSegments
        .flatMap(segment => segment.split(/\s+/))
        .filter(wordElement => wordElement === searchKey)
        .length;

    console.log(occurrenceCounter);
};

async function initiateProcessing() {
    const collectedData = [];
    for await (const dataUnit of process.stdin) {
        collectedData.push(dataUnit.toString());
    }
    processInput(collectedData);
}

initiateProcessing();