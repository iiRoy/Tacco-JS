const fileSystemModule = require('fs');

function computeSlope(x1Coord, y1Coord, x2Coord, y2Coord) {
    const deltaY = y2Coord - y1Coord;
    const deltaX = x2Coord - x1Coord;
    // The original code implicitly handles deltaX === 0 by producing Infinity or -Infinity.
    // Infinity >= 0 is true, -Infinity >= 0 is false, so this explicit handling is behaviorally equivalent.
    if (deltaX === 0) {
        return deltaY >= 0 ? Infinity : -Infinity;
    }
    return deltaY / deltaX;
}

function processInputData() {
    const standardInputFd = process.stdin.fd;

    const inputStats = fileSystemModule.fstatSync(standardInputFd);
    const totalInputLength = inputStats.size;

    const rawInputBuffer = Buffer.alloc(totalInputLength);

    const actualBytesRead = fileSystemModule.readSync(standardInputFd, rawInputBuffer, 0, totalInputLength, 0);

    const inputLines = rawInputBuffer.toString('utf8', 0, actualBytesRead).split('\n');

    const effectiveLineCount = inputLines.length - 1; // Exclude the last line, often empty

    for (let lineIdx = 0; lineIdx < effectiveLineCount; lineIdx++) {
        const currentLineCoordsStr = inputLines[lineIdx].split(',');
        const numericCoords = currentLineCoordsStr.map(Number);

        const xA = numericCoords[0], yA = numericCoords[1];
        const xB = numericCoords[2], yB = numericCoords[3];
        const xC = numericCoords[4], yC = numericCoords[5];
        const xD = numericCoords[6], yD = numericCoords[7];

        const slopeAB = computeSlope(xA, yA, xB, yB);
        const slopeBC = computeSlope(xB, yB, xC, yC);
        const slopeCD = computeSlope(xC, yC, xD, yD);
        const slopeDA = computeSlope(xD, yD, xA, yA);

        let nonNegativeSlopeCounter = 0;

        if (slopeAB >= 0) {
            nonNegativeSlopeCounter++;
        }
        if (slopeBC >= 0) {
            nonNegativeSlopeCounter++;
        }
        if (slopeCD >= 0) {
            nonNegativeSlopeCounter++;
        }
        if (slopeDA >= 0) {
            nonNegativeSlopeCounter++;
        }

        const finalResult = (nonNegativeSlopeCounter % 2 !== 0) ? 'YES' : 'NO';
        console.log(finalResult);
    }
}

processInputData();
