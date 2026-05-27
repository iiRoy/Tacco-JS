const { readFileSync: obtainFileContent } = require('fs');

const processRawText = (textualData) => textualData.trim().split('\n').map(Number);

const numericSequence = processRawText(obtainFileContent('/dev/stdin', 'utf8'));
let sequencePointer = 0;

while (true) {
    const modulusValue = numericSequence[sequencePointer++];

    if (modulusValue === 0) {
        break;
    }

    if (modulusValue === 1) {
        console.log("");
        continue;
    }

    const squareResidueSet = new Set();
    for (let k = 1; k < modulusValue; k++) {
        squareResidueSet.add((k * k) % modulusValue);
    }
    const distinctSquareResidues = Array.from(squareResidueSet).sort((a, b) => a - b);

    const maxDifferenceIndex = (modulusValue - 1) / 2;
    const differenceTally = Array.from({ length: maxDifferenceIndex + 1 }, () => 0);

    distinctSquareResidues.forEach((valA, idxA) => {
        distinctSquareResidues.slice(idxA + 1).forEach((valB) => {
            const directDifference = (valA - valB + modulusValue) % modulusValue;
            const foldedDifference = directDifference > maxDifferenceIndex ? modulusValue - directDifference : directDifference;
            differenceTally[foldedDifference] += 2;
        });
    });

    differenceTally.slice(1).forEach(countEntry => console.log(countEntry * 2));
}
