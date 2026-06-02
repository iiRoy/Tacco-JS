const fileSystemModule = require('fs');

const processAndNormalizeString = (inputString) => {
    return inputString.trim().toLowerCase();
};

const rawFileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const cleanedFileContent = rawFileContent.trim();
const contentLines = cleanedFileContent.split("\n");

const primarySearchTerm = processAndNormalizeString(contentLines[0]);

let totalFoundOccurrences = 0;
let currentLinePointer = 1;

let activeLine = contentLines[currentLinePointer];

while (activeLine !== 'END_OF_TEXT') {
    const processedActiveLine = processAndNormalizeString(activeLine);

    const wordsFromLine = processedActiveLine.split(' ');

    let matchesInCurrentLine = 0;
    for (const wordSegment of wordsFromLine) {
        if (wordSegment === primarySearchTerm) {
            matchesInCurrentLine++;
        }
    }
    totalFoundOccurrences += matchesInCurrentLine;

    currentLinePointer++;
    activeLine = contentLines[currentLinePointer];
}

console.log(totalFoundOccurrences);
