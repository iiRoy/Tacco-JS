const readStdinContent = () => {
    const fileSystemModule = require('fs');
    const inputBufferLength = fileSystemModule.fstatSync(process.stdin.fd).size;
    const stdinBuffer = Buffer.alloc(inputBufferLength);
    const actualBytesRead = fileSystemModule.readSync(process.stdin.fd, stdinBuffer, 0, inputBufferLength, 0);
    return stdinBuffer.toString('utf8', 0, actualBytesRead).split('\n');
};

const createInitializedMatrix = (rows, cols, initialValue) => {
    const resultMatrix = [];
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        const currentRow = [];
        for (let colIndex = 0; colIndex < cols; colIndex++) {
            currentRow[colIndex] = initialValue;
        }
        resultMatrix[rowIndex] = currentRow;
    }
    return resultMatrix;
};

const getMaxOfArray = (arr) => {
    if (arr.length === 0) {
        return -Infinity;
    }
    return Math.max(...arr);
};

const calculateMaxScore = (currentMelodyValue, availablePhrases) => {
    if (currentMelodyValue <= 0) {
        return 0;
    }

    const numPhrases = availablePhrases.length;
    const dynamicProgrammingTable = createInitializedMatrix(numPhrases + 1, currentMelodyValue + 1, 0);

    for (let phraseIndex = 0; phraseIndex < numPhrases; phraseIndex++) {
        for (let melodyIndex = 0; melodyIndex <= currentMelodyValue; melodyIndex++) {
            const [phraseStart, phraseLength, phrasePoints] = availablePhrases[phraseIndex];

            const scoreWithoutCurrentPhrase = dynamicProgrammingTable[phraseIndex][melodyIndex];

            let scoreWithCurrentPhrase = -Infinity;

            if (phraseStart <= melodyIndex) {
                const sliceStart = (phraseLength > melodyIndex) ? 0 : (melodyIndex - phraseLength);
                const sliceEnd = melodyIndex - phraseStart + 1;

                const relevantPreviousScores = dynamicProgrammingTable[phraseIndex + 1].slice(sliceStart, sliceEnd);
                
                const maxPreviousScoreInRange = getMaxOfArray(relevantPreviousScores);
                
                if (maxPreviousScoreInRange !== -Infinity) {
                    scoreWithCurrentPhrase = maxPreviousScoreInRange + phrasePoints;
                }
            }
            
            dynamicProgrammingTable[phraseIndex + 1][melodyIndex] = Math.max(scoreWithoutCurrentPhrase, scoreWithCurrentPhrase);
        }
    }
    return dynamicProgrammingTable[numPhrases][currentMelodyValue];
};

const parseNumericLine = (line) => parseInt(line, 10);

const parsePhraseData = (line) => line.split(' ').map(Number);

const executeProgram = () => {
    const inputLines = readStdinContent();

    let lineCursor = 0;

    const totalPhraseCount = parseNumericLine(inputLines[lineCursor++]);
    const availablePhrases = [];
    for (let i = 0; i < totalPhraseCount; i++) {
        availablePhrases.push(parsePhraseData(inputLines[lineCursor++]));
    }

    const totalMelodyCount = parseNumericLine(inputLines[lineCursor++]);
    const targetMelodies = [];
    for (let i = 0; i < totalMelodyCount; i++) {
        targetMelodies.push(parseNumericLine(inputLines[lineCursor++]));
    }

    if (totalPhraseCount === 0) {
        console.log(-1);
        return;
    }

    const finalScores = [];
    let allScoresValid = true;

    for (const currentMelody of targetMelodies) {
        const currentMaxScore = calculateMaxScore(currentMelody, availablePhrases);
        if (currentMaxScore === 0) {
            allScoresValid = false;
            break;
        } else {
            finalScores.push(currentMaxScore);
        }
    }

    if (!allScoresValid) {
        console.log(-1);
    } else {
        for (const score of finalScores) {
            console.log(score);
        }
    }
};

executeProgram();
