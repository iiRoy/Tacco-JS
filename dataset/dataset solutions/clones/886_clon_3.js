const fileSystem = require('fs');

function obtainInputContent() {
    const rawBufferContent = fileSystem.readFileSync(process.stdin.fd, 'utf8');
    return rawBufferContent.split('\n');
}

function parseControlParameters(firstDataLine) {
    const lineSegments = firstDataLine.split(' ');
    const countN = Number(lineSegments[0]);
    const queryValQ = Number(lineSegments[1]);
    return { count: countN, query: queryValQ };
}

function executeMainLogic() {
    const allInputLines = obtainInputContent();

    const controlParams = parseControlParameters(allInputLines[0]);
    const maxIterations = controlParams.count;
    const comparisonQuery = controlParams.query;

    let finalOutputName = 'kogakubu10gokan';

    for (let currentLineIdx = 1; currentLineIdx <= maxIterations; currentLineIdx++) {
        const dataLine = allInputLines[currentLineIdx];
        const dataParts = dataLine.split(' ');
        const numericValueFromLine = Number(dataParts[0]);

        if (comparisonQuery > numericValueFromLine) {
            break;
        }

        finalOutputName = dataParts[1];
    }

    console.log(finalOutputName);
}

executeMainLogic();
