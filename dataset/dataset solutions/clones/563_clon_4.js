function calculateMaxTripletSum(dataSeries) {
    if (dataSeries.length < 3) {
        console.log(undefined);
        return;
    }

    const maxFound = dataSeries.slice(0, dataSeries.length - 2).reduce((currentHighest, _, idx) => {
        const currentTripletSum = dataSeries[idx] + dataSeries[idx + 1] + dataSeries[idx + 2];
        return Math.max(currentHighest, currentTripletSum);
    }, -Infinity);

    console.log(maxFound);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const rawLines = fileContent.trim().split('\n');

const terminationIndex = rawLines.indexOf('0 0');
const effectiveLines = terminationIndex !== -1 ? rawLines.slice(0, terminationIndex) : rawLines;

effectiveLines.reduce((processingState, lineText, lineIndex) => {
    const parsedNumbers = lineText.split(' ').map(Number);

    if (parsedNumbers.length === 2 || lineIndex === effectiveLines.length - 1) {
        if (!processingState.isFirstGroup && processingState.currentAccumulatedNumbers.length > 0) {
            calculateMaxTripletSum(processingState.currentAccumulatedNumbers);
        }
        processingState.currentAccumulatedNumbers = [];
        processingState.isFirstGroup = false;
    } else {
        processingState.currentAccumulatedNumbers.push(parsedNumbers[0]);
    }
    return processingState;
}, { currentAccumulatedNumbers: [], isFirstGroup: true });
