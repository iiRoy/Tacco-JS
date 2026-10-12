const fileSystemHandler = require('fs');

function calculateSlope(yCoord1, xCoord1, yCoord2, xCoord2) {
    return (yCoord1 - yCoord2) / (xCoord1 - xCoord2);
}

function readStandardInput() {
    const standardInputFd = process.stdin.fd;
    const fileStats = fileSystemHandler.fstatSync(standardInputFd);
    const dataSize = fileStats.size;

    const rawDataBuffer = Buffer.alloc(dataSize);
    const actualBytesCount = fileSystemHandler.readSync(standardInputFd, rawDataBuffer, 0, dataSize, 0);

    return rawDataBuffer.toString('utf8', 0, actualBytesCount).split('\n');
}

const processedLines = readStandardInput();

function executeCoordinateAnalysis() {
    const effectiveLineCount = processedLines.length - 1;

    for (let lineIdx = 0; lineIdx < effectiveLineCount; lineIdx++) {
        const currentCoordSet = processedLines[lineIdx].split(',').map(Number);

        let positiveSlopeTally = 0;
        let negativeSlopeTally = 0;

        const updateSlopeTallies = (slopeValue) => {
            if (slopeValue >= 0) {
                positiveSlopeTally++;
            } else {
                negativeSlopeTally++;
            }
        };

        const slopeOne = calculateSlope(currentCoordSet[1], currentCoordSet[0], currentCoordSet[3], currentCoordSet[2]);
        const slopeTwo = calculateSlope(currentCoordSet[3], currentCoordSet[2], currentCoordSet[5], currentCoordSet[4]);
        const slopeThree = calculateSlope(currentCoordSet[5], currentCoordSet[4], currentCoordSet[7], currentCoordSet[6]);
        const slopeFour = calculateSlope(currentCoordSet[7], currentCoordSet[6], currentCoordSet[1], currentCoordSet[0]);

        updateSlopeTallies(slopeOne);
        updateSlopeTallies(slopeTwo);
        updateSlopeTallies(slopeThree);
        updateSlopeTallies(slopeFour);

        console.log(positiveSlopeTally % 2 ? 'YES' : 'NO');
    }
}

executeCoordinateAnalysis();
