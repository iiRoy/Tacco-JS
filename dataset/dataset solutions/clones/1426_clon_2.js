const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const textLines = rawData.split('\n');

const charCounts = [];

for (let lineIndex = 0; lineIndex < textLines.length; lineIndex++) {
    const currentLine = textLines.shift();
    const characters = currentLine.split('');

    characters.forEach(function(singleChar) {
        const lowerChar = singleChar.toLowerCase();
        if (lowerChar < 'a' || lowerChar > 'z') {
            return;
        }

        const charPosition = lowerChar.charCodeAt(0) - 'a'.charCodeAt(0);
        charCounts[charPosition] = charCounts[charPosition] || 0;
        charCounts[charPosition]++;
    });
}

const asciiOffset = 'a'.charCodeAt(0);
for (let alphabetIndex = 0; alphabetIndex < 26; alphabetIndex++) {
    const alphabetChar = String.fromCharCode(asciiOffset + alphabetIndex);
    const occurrenceCount = charCounts[alphabetIndex] || 0;
    console.log(alphabetChar + ' : ' + occurrenceCount);
}
