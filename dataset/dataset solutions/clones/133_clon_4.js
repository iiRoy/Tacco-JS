const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let lineBuffer = [];

inputReader.on('line', (lineContent) => {
  lineBuffer.push(lineContent);
});

inputReader.on('close', () => {
  processAllCases(lineBuffer);
});

const evaluateSeries = (valueArray) => {
    const workStack = [[0, 0, 0]]; 
    let successFlag = false;

    while (workStack.length > 0) {
        const currentTask = workStack.pop();
        const currentPosition = currentTask[0];
        const leftBoundaryValue = currentTask[1];
        const rightBoundaryValue = currentTask[2];

        if (currentPosition === valueArray.length) {
            successFlag = true;
            break; 
        }

        const nextElement = valueArray[currentPosition];

        const canExtendLeft = (nextElement > leftBoundaryValue);
        const canExtendRight = (nextElement > rightBoundaryValue);

        if (canExtendRight) {
            workStack.push([currentPosition + 1, leftBoundaryValue, nextElement]);
        }
        if (canExtendLeft) {
            workStack.push([currentPosition + 1, nextElement, rightBoundaryValue]);
        }
    }

    return successFlag;
};

const processAllCases = (dataLines) => {
    let currentLineIndex = 0;
    const totalTestSets = Number.parseInt(dataLines[currentLineIndex++], 10);

    for (let setIndex = 0; setIndex < totalTestSets; setIndex++) {
        const currentEntry = dataLines[currentLineIndex++];
        const numericalValues = currentEntry.split(' ').map(Number.parseFloat);

        const resultStatus = evaluateSeries(numericalValues);

        if (resultStatus) {
            process.stdout.write('YES\n');
        } else {
            process.stdout.write('NO\n');
        }
    }
};