const segmentsBuffer = [];
const entryPoint = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

entryPoint.on('line', (currentPiece) => {
    segmentsBuffer.push(currentPiece);
});

entryPoint.on('close', () => {
    processInputPayload(segmentsBuffer);
});

function processInputPayload(fullDataSet) {
    let dataCursor = 0;
    const operationCount = Number(fullDataSet[dataCursor++]);

    const numericTuples = [];
    for (let iterationIndex = 0; iterationIndex < operationCount; iterationIndex++) {
        const firstStringRep = fullDataSet[dataCursor++];
        const secondStringRep = fullDataSet[dataCursor++];
        numericTuples.push([firstStringRep, secondStringRep]);
    }

    const summarizedOutputs = numericTuples.map(valueCouple => {
        const primaryValue = BigInt(valueCouple[0]);
        const secondaryValue = BigInt(valueCouple[1]);
        const aggregateValue = primaryValue + secondaryValue;
        const stringifiedAggregate = aggregateValue.toString();

        return stringifiedAggregate.length > 80 ? 'overflow' : stringifiedAggregate;
    });

    summarizedOutputs.forEach(displayItem => {
        console.log(displayItem);
    });
}