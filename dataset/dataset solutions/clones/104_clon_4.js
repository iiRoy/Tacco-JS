const fileSystemModule = require('fs');
const standardInputFileDescriptor = process.stdin.fd;
const totalInputSize = fileSystemModule.fstatSync(standardInputFileDescriptor).size;
const dataCaptureBuffer = Buffer.alloc(totalInputSize);
const actualBytesRead = fileSystemModule.readSync(standardInputFileDescriptor, dataCaptureBuffer, 0, totalInputSize, 0);
const processedInputLines = dataCaptureBuffer.toString('utf8', 0, actualBytesRead).trim().split('\n');

const analyzeLinePair = (firstString, secondString) => {
    const firstElementArray = firstString.trim().split(' ');
    const secondElementArray = secondString.trim().split(' ');

    const comparisonResults = firstElementArray.reduce((currentAccumulator, currentFirstElement, currentFirstIndex) => {
        if (currentFirstElement === secondElementArray[currentFirstIndex]) {
            currentAccumulator.exactPositionMatches++;
        }
        
        const elementsAfterCurrentIndex = secondElementArray.slice(currentFirstIndex + 1);
        const crossPositionMatches = elementsAfterCurrentIndex.filter(secondElement => currentFirstElement === secondElement).length;
        currentAccumulator.differentPositionMatches += crossPositionMatches;
        
        return currentAccumulator;
    }, { exactPositionMatches: 0, differentPositionMatches: 0 });

    return [comparisonResults.exactPositionMatches, comparisonResults.differentPositionMatches];
};

const allCalculatedOutputs = processedInputLines.reduce((outputCollector, currentInputLine, lineIndex, fullInputArray) => {
    if (lineIndex % 2 === 0) {
        const subsequentInputLine = fullInputArray[lineIndex + 1];
        if (subsequentInputLine !== undefined) {
            outputCollector.push(analyzeLinePair(currentInputLine, subsequentInputLine));
        }
    }
    return outputCollector;
}, []);

allCalculatedOutputs.forEach(resultTuple => {
    console.log(resultTuple[0], resultTuple[1]);
});
