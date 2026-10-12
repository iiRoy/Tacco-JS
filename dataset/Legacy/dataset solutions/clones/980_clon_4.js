const configuration = { sourcePath: '/dev/stdin', lineDelimiter: '\n' };

const assert = require('assert');

const rawInputLines = require('fs').readFileSync(configuration.sourcePath, 'ascii')
  .split(configuration.lineDelimiter);

const [gridHeight, gridWidth] = rawInputLines[0].split(' ').map(Number);

const binaryStringToBigInt = (binaryString) => BigInt('0b' + binaryString);

const gridLines = rawInputLines.slice(1, 1 + gridHeight).map(binaryStringToBigInt);

const [patternHeight, patternWidth] = rawInputLines[1 + gridHeight].split(' ').map(Number);

const patternLines = rawInputLines.slice(1 + gridHeight + 1, 1 + gridHeight + 1 + patternHeight).map(binaryStringToBigInt);

if (gridHeight < patternHeight || gridWidth < patternWidth) {
    process.exit();
}

const matchAccumulator = Array.from({ length: gridHeight - patternHeight + 1 }, () =>
    Array(gridWidth - patternWidth + 1).fill(0)
);

const patternBitMask = (1n << BigInt(patternWidth)) - 1n;

for (let currentGridRowIndex = 0; currentGridRowIndex < gridHeight; currentGridRowIndex++) {
    const currentGridBigInt = gridLines[currentGridRowIndex];

    for (let currentPatternRowIndex = 0; currentPatternRowIndex < patternHeight; currentPatternRowIndex++) {
        const currentPatternBigInt = patternLines[currentPatternRowIndex];

        const potentialMatchTopRow = currentGridRowIndex - currentPatternRowIndex;

        if (potentialMatchTopRow < 0 || potentialMatchTopRow > gridHeight - patternHeight) {
            continue;
        }

        for (let colShift = 0; colShift <= gridWidth - patternWidth; colShift++) {
            const gridSegmentAtOffset = (currentGridBigInt >> BigInt(colShift)) & patternBitMask;

            if (gridSegmentAtOffset === currentPatternBigInt) {
                matchAccumulator[potentialMatchTopRow][colShift]++;
            }
        }
    }
}

for (let r = 0; r < matchAccumulator.length; r++) {
    for (let c = 0; c < matchAccumulator[r].length; c++) {
        if (matchAccumulator[r][c] === patternHeight) {
            console.log('%s %s', r, c);
        }
    }
}
