const fileSystemModule = require('fs');

const inputDescriptor = process.stdin.fd;
const inputStats = fileSystemModule.fstatSync(inputDescriptor);
const inputBufferLength = inputStats.size;

const dataBuffer = Buffer.alloc(inputBufferLength);

const actualBytesRead = fileSystemModule.readSync(inputDescriptor, dataBuffer, 0, inputBufferLength, 0);

const rawInputString = dataBuffer.toString('utf8', 0, actualBytesRead);
const linesOfInput = rawInputString.trim().split('\n');

processGameRounds();

function calculateMatches(playerGuessLine, secretCodeLine) {
    let exactMatches = 0;
    let partialMatches = 0;

    const playerGuessDigits = playerGuessLine.trim().split(' ');
    const secretCodeDigits = secretCodeLine.trim().split(' ');

    const guessLength = playerGuessDigits.length;
    const codeLength = secretCodeDigits.length;

    for (let digitIndex = 0; digitIndex < guessLength; digitIndex++) {
        if (playerGuessDigits[digitIndex] === secretCodeDigits[digitIndex]) {
            exactMatches++;
        }
    }

    for (let guessDigitIdx = 0; guessDigitIdx < guessLength; guessDigitIdx++) {
        const currentGuessDigit = playerGuessDigits[guessDigitIdx];
        for (let codeDigitIdx = 0; codeDigitIdx < codeLength; codeDigitIdx++) {
            if (currentGuessDigit === secretCodeDigits[codeDigitIdx]) {
                partialMatches++;
            }
        }
    }

    return [exactMatches, partialMatches];
}

function processGameRounds() {
    const totalInputLines = linesOfInput.length;
    let currentLineIndex = 0;

    while (currentLineIndex < totalInputLines) {
        const playerGuessLine = linesOfInput[currentLineIndex];
        const secretCodeLine = linesOfInput[currentLineIndex + 1];

        if (playerGuessLine === undefined || secretCodeLine === undefined) {
            break;
        }

        const [roundExactMatches, roundPartialMatches] = calculateMatches(playerGuessLine, secretCodeLine);

        console.log(roundExactMatches, roundPartialMatches);

        currentLineIndex += 2;
    }
}
