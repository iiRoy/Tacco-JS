const fileSystemModule = require('fs');

const INPUT_FILE_PATH = '/dev/stdin';
const LINE_SEPARATOR = '\n';

const appSettings = {
    sourcePath: INPUT_FILE_PATH,
    lineDelimiter: LINE_SEPARATOR
};

const getFileContentLines = (filePath, delimiter) => {
    const fileBuffer = fileSystemModule.readFileSync(filePath, 'utf-8');
    return fileBuffer.split(delimiter);
};

const rawDataLines = getFileContentLines(appSettings.sourcePath, appSettings.lineDelimiter);

const getNumericDataFromLines = (linesArray) => {
    const relevantLines = linesArray.slice(1, linesArray.length - 1);
    return relevantLines.map(str => parseInt(str, 10));
};

const numericData = getNumericDataFromLines(rawDataLines);

const initialValue = numericData[0];
const remainingValues = numericData.slice(1);

const createInitialReducerState = (initialMinVal) => {
    return { maxDifference: -Infinity, currentMin: initialMinVal };
};

const processValueForMaxDiff = (accumulator, currentNum) => {
    const potentialDifference = currentNum - accumulator.currentMin;
    accumulator.maxDifference = Math.max(accumulator.maxDifference, potentialDifference);
    accumulator.currentMin = Math.min(accumulator.currentMin, currentNum);
    return accumulator;
};

const initialAccumulatorState = createInitialReducerState(initialValue);
const finalOutcome = remainingValues.reduce(processValueForMaxDiff, initialAccumulatorState);

console.log(finalOutcome.maxDifference);
