const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputData.trim().split('\n');

function processInputBlocks(dataSegments, currentPosition) {
    const blockTarget = Number(dataSegments[currentPosition]);

    if (blockTarget === 0) {
        return;
    }

    const nineElements = dataSegments.slice(currentPosition + 1, currentPosition + 1 + 9);
    const accumulatedValue = nineElements.reduce((accumulator, currentString) => accumulator + Number(currentString), 0);

    console.log(blockTarget - accumulatedValue);

    processInputBlocks(dataSegments, currentPosition + 10);
}

processInputBlocks(processedLines, 0);
