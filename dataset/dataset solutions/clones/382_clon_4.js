const fileSystem = require('node:fs');
const textualContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const allLines = textualContent.trim().split('\n');

const iterationCount = parseInt(allLines[0], 10);

const testCaseSegments = allLines.slice(1, 1 + iterationCount);

const computeSequence = (startPoint, endPoint, currentPath = []) => {
    currentPath.push(startPoint);

    if (startPoint === endPoint) {
        return currentPath;
    }

    let nextStep;
    if (startPoint < endPoint) {
        nextStep = startPoint + 1;
    } else if (startPoint > endPoint && startPoint <= 5) {
        nextStep = startPoint - 1;
    } else { // startPoint > endPoint && startPoint > 5
        let potentialNext = startPoint + 1;
        if (potentialNext === 10) {
            nextStep = 5;
        } else {
            nextStep = potentialNext;
        }
    }
    return computeSequence(nextStep, endPoint, currentPath);
};

const allOutputs = testCaseSegments.map(segment => {
    const [originString, targetString] = segment.split(' ');
    const originNum = parseInt(originString, 10);
    const targetNum = parseInt(targetString, 10);

    const pathResult = computeSequence(originNum, targetNum);
    return pathResult.join(' ');
});

process.stdout.write(allOutputs.join('\n') + '\n');