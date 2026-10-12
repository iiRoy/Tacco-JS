const sourceText = require('fs').readFileSync('/dev/stdin', 'utf8');

const charFrequencies = Array(26).fill(0);

sourceText.split('').forEach(char => {
    const lowerChar = char.toLowerCase();
    const charCode = lowerChar.charCodeAt(0);
    const alphabetIndex = charCode - 97;

    if (alphabetIndex >= 0 && alphabetIndex < 26) {
        charFrequencies[alphabetIndex]++;
    }
});

const outputLines = charFrequencies.map((countValue, idx) => {
    const letterIdentifier = String.fromCharCode(97 + idx);
    return `${letterIdentifier} : ${countValue}`;
});

const resultString = outputLines.join('\n');

console.log(resultString.trim());
