const fileSystem = require('fs');
const INPUT_FILE_PATH = '/dev/stdin';

const rawFileContent = fileSystem.readFileSync(INPUT_FILE_PATH, 'utf8');
let dataSegments = rawFileContent.split('\n');

const getNextSegment = (segmentArray) => {
    if (segmentArray.length === 0) {
        return undefined;
    }
    return segmentArray.shift();
};

const discardedFirstLine = getNextSegment(dataSegments);
let currentMinimumValue = getNextSegment(dataSegments);

let lineToProcess;
while ((lineToProcess = getNextSegment(dataSegments)) !== undefined) {
    if (lineToProcess < currentMinimumValue) {
        currentMinimumValue = lineToProcess;
    }
}

console.log(currentMinimumValue);
