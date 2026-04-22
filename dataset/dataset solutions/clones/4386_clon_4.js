const getLineReader = require('readline');

async function processInputData() {
    const inputReader = getLineReader.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    let collectedLines = [];
    for await (const lineText of inputReader) {
        collectedLines.push(lineText);
    }

    inputReader.close();
    interpretData(collectedLines);
}

function interpretData(allLines) {
    const sequenceSize = Number(allLines[0]);
    const sequenceValues = allLines[1].split(' ').map(Number);

    const finalModificationCount = determineModificationCount(0, sequenceValues, 0);

    console.log(finalModificationCount);
}

function determineModificationCount(currentIndex, currentArray, currentCount) {
    if (currentIndex >= currentArray.length) {
        return currentCount;
    }

    if (currentArray[currentIndex] === currentIndex + 1) {
        currentCount++;
        if (currentIndex + 1 < currentArray.length && currentArray[currentIndex + 1] === currentIndex + 2) {
            return determineModificationCount(currentIndex + 2, currentArray, currentCount);
        } else {
            return determineModificationCount(currentIndex + 1, currentArray, currentCount);
        }
    } else {
        return determineModificationCount(currentIndex + 1, currentArray, currentCount);
    }
}

processInputData();