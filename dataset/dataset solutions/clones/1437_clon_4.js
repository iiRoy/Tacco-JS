const inputGate = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputGate.on('line', (receivedLine) => {
    const collectedPieces = receivedLine.match(/\S+/g) || [];

    const firstCompositeString = collectedPieces[0] + collectedPieces[2];
    const secondCompositeString = collectedPieces[1] + collectedPieces[3];

    const valueOne = Number(firstCompositeString);
    const valueTwo = Number(secondCompositeString);

    const squaredOne = valueOne * valueOne;
    const squaredTwo = valueTwo * valueTwo;

    const totalSquaredSum = squaredOne + squaredTwo;

    const finalMeasurement = totalSquaredSum ** 0.5;

    console.log(finalMeasurement.toFixed(8));
});