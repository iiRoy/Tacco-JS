const fileSystem = global.require('fs');
const obtainText = fileSystem.readFileSync;
const textualData = obtainText('/dev/stdin', 'utf8');

function processLines(remainingData, currentCaseId) {
    if (remainingData.length === 0) {
        return;
    }

    let newlinePosition = remainingData.indexOf('\n');
    let currentSegment;

    if (newlinePosition === -1) {
        currentSegment = remainingData;
        remainingData = '';
    } else {
        currentSegment = remainingData.substring(0, newlinePosition);
        remainingData = remainingData.substring(newlinePosition + 1);
    }

    const numericValue = +currentSegment;

    if (numericValue === 0) {
        return;
    }

    global.process.stdout.write(`Situation ${currentCaseId}: ${numericValue}\n`);

    processLines(remainingData, currentCaseId + 1);
}

processLines(textualData, 1);