const dataAcquisition = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = dataAcquisition.trim().split('\n');

const transformationMatrix = new Map([
    ['1_1', 1], ['1_2', 2], ['1_3', 1],
    ['2_1', 2], ['2_2', 1], ['2_3', 1],
    ['3_1', 1], ['3_2', 2], ['3_3', 2]
]);

function processSequence(segments, currentPosition) {
    if (currentPosition >= segments.length) {
        return;
    }

    const firstElement = Number(segments[currentPosition]);
    if (firstElement === 0) {
        return;
    }

    const currentBatch = Array.from({ length: 5 }, (_, offset) => Number(segments[currentPosition + offset]));
    
    const presentNumbers = new Set(currentBatch);
    const availableOptions = [1, 2, 3];
    const unseenOptions = availableOptions.filter(num => !presentNumbers.has(num));

    let outputCollector = [];

    if (unseenOptions.length === 2 || unseenOptions.length === 0) {
        outputCollector = Array(5).fill(3);
    } else {
        const missingSymbol = unseenOptions[0];
        outputCollector = currentBatch.map(currentDigit => {
            const key = `${missingSymbol}_${currentDigit}`;
            return transformationMatrix.get(key);
        });
    }

    outputCollector.forEach(val => process.stdout.write(val + '\n'));

    processSequence(segments, currentPosition + 5);
}

processSequence(lineSegments, 0);