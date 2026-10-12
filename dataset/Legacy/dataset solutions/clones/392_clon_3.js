var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var numberSequence = rawData.trim().split("\n").map(Number);

const processModulus = (currentModulus) => {
    if (currentModulus === 0) {
        return false;
    }

    let residueFlags = Array(currentModulus).fill(false);

    for (let outerIdx = 1; outerIdx < currentModulus; outerIdx++) {
        residueFlags[(outerIdx * outerIdx) % currentModulus] = true;
    }

    let quadraticResidues = [];
    residueFlags.forEach((flagValue, index) => {
        if (flagValue) {
            quadraticResidues.push(index);
        }
    });

    const maxDifferenceIndex = Math.floor((currentModulus - 1) / 2);
    let differenceCounts = Array(maxDifferenceIndex + 1).fill(0);

    const numResidues = quadraticResidues.length;
    for (let outerResidueIdx = 0; outerResidueIdx < numResidues; outerResidueIdx++) {
        for (let innerResidueIdx = 0; innerResidueIdx < numResidues; innerResidueIdx++) {
            if (outerResidueIdx === innerResidueIdx) {
                continue;
            }

            let currentDifference = quadraticResidues[outerResidueIdx] - quadraticResidues[innerResidueIdx];

            if (currentDifference < 0) {
                currentDifference += currentModulus;
            }

            if (maxDifferenceIndex < currentDifference) {
                currentDifference -= currentModulus;
            }
            
            differenceCounts[currentDifference]++;
        }
    }

    differenceCounts.slice(1).forEach((countValue) => {
        console.log(countValue * 2);
    });

    return true;
};

let sequencePosition = 0;
while (sequencePosition < numberSequence.length) {
    let modulusToProcess = numberSequence[sequencePosition];
    sequencePosition++;

    if (!processModulus(modulusToProcess)) {
        break;
    }
}
