const processRawInput = (rawContent) => {
    if (typeof rawContent !== 'string') {
        return [];
    }
    return rawContent.trim().split("\n");
};

const calculateSubstringOccurrences = (sourceText, searchString) => {
    return (sourceText.split(searchString)).length - 1;
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputLines = processRawInput(rawInputData);

const targetPhrase = inputLines[0];

let totalOccurrences = 0;

let currentLineIndex = 1;

while (currentLineIndex < inputLines.length) {
    const currentLineContent = inputLines[currentLineIndex];

    if (currentLineContent === "END_OF_TEXT") {
        break;
    }

    const currentLineMatchCount = calculateSubstringOccurrences(currentLineContent, targetPhrase);

    totalOccurrences += currentLineMatchCount;

    currentLineIndex++;
}

console.log(totalOccurrences);
