const fs = require('node:fs');
const inputLines = fs.readFileSync('/dev/stdin', 'utf8').split('\n');

function constructAndDisplayGrid(heightVal, widthVal) {
    const charOptions = ['#', '.'];

    Array.from({ length: heightVal }, (_, rowIdx) => {
        const rowChars = Array.from({ length: widthVal }, (_, colIdx) => {
            return charOptions[(rowIdx + colIdx) % 2];
        });
        process.stdout.write(rowChars.join('') + '\n');
    });
    process.stdout.write('\n');
}

function processDimensionPairs(remainingInput, currentIdx = 0) {
    if (currentIdx >= remainingInput.length) {
        return;
    }

    const currentLine = remainingInput[currentIdx];
    if (!currentLine.trim()) {
        processDimensionPairs(remainingInput, currentIdx + 1);
        return;
    }

    const dimensions = currentLine.split(' ').map(Number);
    const hVal = dimensions[0];
    const wVal = dimensions[1];

    if (hVal === 0 && wVal === 0) {
        return;
    }

    constructAndDisplayGrid(hVal, wVal);

    processDimensionPairs(remainingInput, currentIdx + 1);
}

processDimensionPairs(inputLines);
