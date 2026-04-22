const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

const processInputData = (rawText) => {
    const lines = rawText.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    let relevantLines = [];
    for (let k = 0; k < lines.length; k++) {
        if (lines[k] === '0 0') {
            if (relevantLines.length % 4 === 0) {
                break;
            }
        }
        relevantLines.push(lines[k]);
    }
    return relevantLines;
};

function* generateChunks(collection, chunkSize) {
    let currentBatch = [];
    for (const element of collection) {
        currentBatch.push(element);
        if (currentBatch.length === chunkSize) {
            yield currentBatch;
            currentBatch = [];
        }
    }
}

const analyzeBlock = (blockEntries) => {
    const scoreEntries = blockEntries.map((lineContent, position) => {
        const numericValues = lineContent.split(' ').map(Number);
        return {
            summation: numericValues[0] + numericValues[1],
            initialPosition: position
        };
    });

    const highestScoreEntry = scoreEntries.reduce((accumulator, currentItem) => {
        return (currentItem.summation > accumulator.summation) ? currentItem : accumulator;
    }, { summation: -Infinity, initialPosition: -1 });

    const characterMapping = {
        0: 'A',
        1: 'B',
        2: 'C',
        3: 'D'
    };

    const assignedCharacter = characterMapping[highestScoreEntry.initialPosition];
    return `${assignedCharacter} ${highestScoreEntry.summation}`;
};

const processedLines = processInputData(dataSource);

for (const dataChunk of generateChunks(processedLines, 4)) {
    console.log(analyzeBlock(dataChunk));
}