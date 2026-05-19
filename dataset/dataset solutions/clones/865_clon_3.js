const MAX_MELODY_CAPACITY_LIMIT = 393;

function readStdinContent() {
    const fileSystemModule = require('fs');
    const stdinFileDescriptor = process.stdin.fd;
    const fileStats = fileSystemModule.fstatSync(stdinFileDescriptor);
    const inputByteLength = fileStats.size;
    const inputDataBuffer = Buffer.alloc(inputByteLength);
    const actualBytesReadCount = fileSystemModule.readSync(stdinFileDescriptor, inputDataBuffer, 0, inputByteLength, 0);
    return inputDataBuffer.toString('utf8', 0, actualBytesReadCount).split('\n');
}

function initialize2DArray(rowsCount, colsCount, initialValue) {
    const resultArray = [];
    for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
        resultArray.push(Array(colsCount).fill(initialValue));
    }
    return resultArray;
}

function parsePhraseDefinitions(inputLinesArray, count) {
    const phraseDefinitions = [];
    for (let i = 0; i < count; i++) {
        phraseDefinitions.push(inputLinesArray.shift().split(' ').map(Number));
    }
    return phraseDefinitions;
}

function parseMelodyQueries(inputLinesArray, count) {
    const melodyQueries = [];
    for (let i = 0; i < count; i++) {
        melodyQueries.push(parseInt(inputLinesArray.shift(), 10));
    }
    return melodyQueries;
}

function computeMaxScoresDP(maxMelodyCapacity, phraseDefinitions) {
    const numPhrases = phraseDefinitions.length;
    const dpTable = initialize2DArray(numPhrases + 1, maxMelodyCapacity + 1, 0);

    for (let phraseIdx = 0; phraseIdx < numPhrases; phraseIdx++) {
        const currentPhrase = phraseDefinitions[phraseIdx];
        const phraseStart = currentPhrase[0];
        const phraseLength = currentPhrase[1];
        const phrasePoints = currentPhrase[2];

        for (let currentCapacity = 0; currentCapacity <= maxMelodyCapacity; currentCapacity++) {
            const scoreWithoutCurrentPhrase = dpTable[phraseIdx][currentCapacity];

            let scoreWithCurrentPhrase = 0;
            if (phraseStart <= currentCapacity) {
                let maxPreviousScoreForCombination = 0;
                
                const minPrevCapacityForPhrase = Math.max(0, currentCapacity - phraseLength);
                const maxPrevCapacityForPhrase = currentCapacity - phraseStart;

                for (let prevCapacity = minPrevCapacityForPhrase; prevCapacity <= maxPrevCapacityForPhrase; prevCapacity++) {
                    if (prevCapacity >= 0 && prevCapacity <= maxMelodyCapacity) {
                        maxPreviousScoreForCombination = Math.max(maxPreviousScoreForCombination, dpTable[phraseIdx + 1][prevCapacity]);
                    }
                }
                scoreWithCurrentPhrase = maxPreviousScoreForCombination + phrasePoints;
            }
            dpTable[phraseIdx + 1][currentCapacity] = Math.max(scoreWithoutCurrentPhrase, scoreWithCurrentPhrase);
        }
    }
    return dpTable;
}

function runMainProgram() {
    const rawInputLines = readStdinContent();

    const totalPhrasesCount = parseInt(rawInputLines.shift(), 10);
    const allPhraseDefinitions = parsePhraseDefinitions(rawInputLines, totalPhrasesCount);

    const totalMelodyQueries = parseInt(rawInputLines.shift(), 10);
    const queryMelodyValues = parseMelodyQueries(rawInputLines, totalMelodyQueries);

    const computedDPTable = computeMaxScoresDP(MAX_MELODY_CAPACITY_LIMIT, allPhraseDefinitions);

    const finalScores = [];
    let allQueriesFeasible = true;

    for (const currentQueryMelody of queryMelodyValues) {
        const scoreForMelody = computedDPTable[totalPhrrasesCount][currentQueryMelody];

        if (scoreForMelody === 0) {
            allQueriesFeasible = false;
        } else {
            finalScores.push(scoreForMelody);
        }
    }

    if (!allQueriesFeasible) {
        console.log(-1);
        return;
    }

    for (const score of finalScores) {
        console.log(score);
    }
}

runMainProgram();
