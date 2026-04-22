let operationTally = 0;

function executeSingleSweep(sequenceData, finalIndex) {
    let alterationDetected = false;
    for (let currentPosition = finalIndex; currentPosition >= 1; currentPosition--) {
        if (sequenceData[currentPosition] < sequenceData[currentPosition - 1]) {
            let temporaryValue = sequenceData[currentPosition];
            sequenceData[currentPosition] = sequenceData[currentPosition - 1];
            sequenceData[currentPosition - 1] = temporaryValue;
            alterationDetected = true;
            operationTally++;
        }
    }
    return alterationDetected;
}

function processOrdering(dataCollection) {
    const hasModifications = executeSingleSweep(dataCollection, dataCollection.length - 1);
    if (hasModifications) {
        processOrdering(dataCollection);
    }
}

((sourceContent) => {
    const parsedLines = sourceContent.split('\n');
    const elementCount = parseInt(parsedLines[0], 10);
    const numberArray = parsedLines[1].split(' ', elementCount).map(val => parseInt(val, 10));

    processOrdering(numberArray);

    console.log(numberArray.join(' '));
    console.log(operationTally);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));