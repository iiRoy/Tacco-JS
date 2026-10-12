const fileSystemModule = require('fs');
const standardInputFd = process.stdin.fd;
const fileStats = fileSystemModule.fstatSync(standardInputFd);
const inputDataLength = fileStats.size;

const UTF8_ENCODING = 'utf8';
const NEWLINE_DELIMITER = '\n';
const SPACE_DELIMITER = ' ';

let rawInputContent = '';
if (inputDataLength > 0) {
    const dataBuffer = Buffer.alloc(inputDataLength);
    const actualBytesRead = fileSystemModule.readSync(standardInputFd, dataBuffer, 0, inputDataLength, 0);
    rawInputContent = dataBuffer.toString(UTF8_ENCODING, 0, actualBytesRead);
}

const linesOfInput = rawInputContent.trim().split(NEWLINE_DELIMITER);

executeGameLogic();

function parseLineToArray(lineContent) {
    return lineContent.trim().split(SPACE_DELIMITER);
}

function calculateMatches(playerGuessArray, secretCodeArray) {
    let exactMatchesCount = 0;
    let partialMatchesCount = 0;

    const guessArrayLength = playerGuessArray.length;

    for (let guessDigitIdx = 0; guessDigitIdx < guessArrayLength; guessDigitIdx++) {
        const currentGuessDigit = playerGuessArray[guessDigitIdx];

        if (currentGuessDigit === secretCodeArray[guessDigitIdx]) {
            exactMatchesCount++;
        }

        for (let codeDigitIdx = guessDigitIdx + 1; codeDigitIdx < guessArrayLength; codeDigitIdx++) {
            if (currentGuessDigit === secretCodeArray[codeDigitIdx]) {
                partialMatchesCount++;
            }
        }
    }
    return { exactMatches: exactMatchesCount, partialMatches: partialMatchesCount };
}

function executeGameLogic() {
    const totalInputLines = linesOfInput.length;
    const linesPerRound = 2;

    for (let roundIteration = 0; roundIteration < totalInputLines; roundIteration += linesPerRound) {
        const guessLine = linesOfInput[roundIteration];
        const codeLine = linesOfInput[roundIteration + 1];

        const parsedGuess = parseLineToArray(guessLine);
        const parsedCode = parseLineToArray(codeLine);

        const matchResults = calculateMatches(parsedGuess, parsedCode);
        console.log(matchResults.exactMatches, matchResults.partialMatches);
    }
}
