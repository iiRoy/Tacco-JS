const sourceReader = require('fs');
const rawContent = sourceReader.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawContent.trim().split('\n');

let currentPosition = 0;
while (currentPosition < processedLines.length) {
    const initialValue = Number(processedLines[currentPosition]);

    if (initialValue === 0) {
        break;
    }

    const tenElements = Array.from({ length: 10 }, (_, idx) => {
        const lineContent = processedLines[currentPosition + idx];
        return lineContent !== undefined ? Number(lineContent) : NaN;
    });

    const blockSum = tenElements.reduce((accumulator, currentNumber) => accumulator + currentNumber, 0);

    console.log(initialValue - blockSum);

    currentPosition += 11;
}
