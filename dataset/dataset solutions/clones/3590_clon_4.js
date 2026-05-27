const inputBuffer = [];
const ioHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioHandler.on('line', (currentLine) => {
    inputBuffer.push(currentLine);
});

ioHandler.on('close', () => {
    const [elementCountStr, spanLengthStr] = inputBuffer[0].split(" ");
    const elementCount = Number(elementCountStr);
    const spanLength = Number(spanLengthStr);
    const pointCoordinates = inputBuffer[1].split(" ").map(Number);

    const determinePathCost = (firstPoint, secondPoint) => {
        const distanceBetween = Math.abs(secondPoint - firstPoint);
        const costFromOrigin = Math.min(Math.abs(firstPoint), Math.abs(secondPoint));
        return costFromOrigin + distanceBetween;
    };

    const windowStartIndices = Array.from({ length: elementCount - spanLength + 1 }, (_, idx) => idx);

    const minTraversalCost = windowStartIndices.reduce((currentMinimum, windowStartIdx) => {
        const leftBoundaryPoint = pointCoordinates[windowStartIdx];
        const rightBoundaryPoint = pointCoordinates[windowStartIdx + spanLength - 1];
        const currentWindowCost = determinePathCost(leftBoundaryPoint, rightBoundaryPoint);
        return Math.min(currentMinimum, currentWindowCost);
    }, Infinity);

    console.log(minTraversalCost);
});
