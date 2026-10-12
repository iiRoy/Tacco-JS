function processInputString(rawInput) {
    const trimmedInput = rawInput.trim();
    let processedChars = Array.from(trimmedInput);

    const charToInject = 'A';
    const insertionIndices = [0, 4, 6, 8];

    insertionIndices.forEach(function(targetPosition) {
        const characterAtPosition = processedChars[targetPosition];
        if (characterAtPosition !== charToInject) {
            processedChars.splice(targetPosition, 0, charToInject);
        }
    });

    const resultString = processedChars.join("");
    const targetComparisonString = "AKIHABARA";

    const isMatch = resultString === targetComparisonString;

    if (isMatch) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

const standardInputFilePath = '/dev/stdin';
const fileContent = require('fs').readFileSync(standardInputFilePath, 'utf8');

processInputString(fileContent);
