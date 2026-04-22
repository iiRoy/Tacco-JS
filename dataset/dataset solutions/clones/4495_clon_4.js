const dataStream = require('readline');

let firstInputLineProcessed = false;

const lineInputHandler = dataStream.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

function computeSymmetryLength(sourcePhrase) {
    for (let currentCandidateLength = sourcePhrase.length; currentCandidateLength >= 2; currentCandidateLength--) {
        if (currentCandidateLength % 2 === 0) {
            const partitionSize = currentCandidateLength / 2;
            const initialPortion = sourcePhrase.substring(0, partitionSize);
            const concludingPortion = sourcePhrase.substring(partitionSize, currentCandidateLength);

            if (initialPortion === concludingPortion) {
                return currentCandidateLength;
            }
        }
    }
    return 0;
}

lineInputHandler.on('line', (receivedLine) => {
    if (firstInputLineProcessed) {
        return;
    }
    firstInputLineProcessed = true;

    const lineComponents = receivedLine.split(' ');
    let primaryComponent = lineComponents[0];

    if (primaryComponent.length > 0) {
        primaryComponent = primaryComponent.substring(0, primaryComponent.length - 1);
    }

    const finalValue = computeSymmetryLength(primaryComponent);
    process.stdout.write(finalValue.toString() + '\n');
    
    lineInputHandler.close();
});

lineInputHandler.on('close', () => {
    // Exit gracefully once processing is complete.
});