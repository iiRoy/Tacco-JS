process.stdin.resume();
process.stdin.setEncoding('utf8');

const squareValue = (val) => val * val;

const computeSquaredDifference = (firstCoord, secondCoord) => squareValue(firstCoord - secondCoord);

process.stdin.on('data', (receivedData) => {
    const parsedNumbers = receivedData
        .split(" ")
        .map(Number);

    const [coordAX, coordAY, coordBX, coordBY] = parsedNumbers;

    const squaredDeltaX = computeSquaredDifference(coordAX, coordBX);
    const squaredDeltaY = computeSquaredDifference(coordAY, coordBY);

    const sumOfSquaredDeltas = squaredDeltaX + squaredDeltaY;

    console.log(Math.sqrt(sumOfSquaredDeltas));
});
