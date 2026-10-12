var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var rawInputLines = fileContent.split('\n');

var alphabetCharCounts = [];

const ASCII_CODE_A = 'a'.charCodeAt(0);
const ASCII_CODE_Z = 'z'.charCodeAt(0);
const ALPHABET_LENGTH = 26;

const initialLineCount = rawInputLines.length;
const numberOfLinesToProcess = Math.ceil(initialLineCount / 2);

for (let lineIteration = 0; lineIteration < numberOfLinesToProcess; lineIteration++) {
    var processedLine = rawInputLines.shift();
    var lineCharacters = processedLine.split('');

    lineCharacters.forEach(function(singleChar) {
        var lowerCaseChar = singleChar.toLowerCase();

        const charCode = lowerCaseChar.charCodeAt(0);
        if (charCode < ASCII_CODE_A || charCode > ASCII_CODE_Z) {
            return;
        }

        var charAlphabetIndex = charCode - ASCII_CODE_A;

        alphabetCharCounts[charAlphabetIndex] = alphabetCharCounts[charAlphabetIndex] ?? 0;
        alphabetCharCounts[charAlphabetIndex]++;
    });
}

for (let alphabetPosition = 0; alphabetPosition < ALPHABET_LENGTH; alphabetPosition++) {
    var currentAlphabetChar = String.fromCharCode(ASCII_CODE_A + alphabetPosition);
    var charOccurrenceCount = alphabetCharCounts[alphabetPosition] ?? 0;
    console.log(currentAlphabetChar + ' : ' + charOccurrenceCount);
}
