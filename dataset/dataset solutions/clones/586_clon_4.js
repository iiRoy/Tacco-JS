const eliminateConsecutiveGroups = (digitSequence) => {
    const performCleaningPass = (currentSeq) => {
        let nextSeqChars = [];
        let traversalIndex = 0;
        while (traversalIndex < currentSeq.length) {
            let charIdentifier = currentSeq[traversalIndex];
            let consecutiveCount = 0;
            let checkIndex = traversalIndex;
            while (checkIndex < currentSeq.length && currentSeq[checkIndex] === charIdentifier) {
                consecutiveCount++;
                checkIndex++;
            }
            if (consecutiveCount < 4) {
                for (let k = 0; k < consecutiveCount; k++) {
                    nextSeqChars.push(charIdentifier);
                }
            }
            traversalIndex = checkIndex;
        }
        const newSequenceRepresentation = nextSeqChars.join('');
        if (newSequenceRepresentation === currentSeq) {
            return newSequenceRepresentation;
        } else {
            return performCleaningPass(newSequenceRepresentation);
        }
    };
    return performCleaningPass(digitSequence);
};

const processTestCase = (elementList) => {
    let shortestLengthFound = Infinity;

    const generatedSequenceVariants = [];
    const currentListLength = elementList.length;

    for (let p = 0; p < currentListLength; p++) {
        if (p < currentListLength - 1) {
            let variantOne = [...elementList];
            variantOne[p] = variantOne[p + 1];
            generatedSequenceVariants.push(variantOne.join(''));
        }

        if (p > 0) {
            let variantTwo = [...elementList];
            variantTwo[p] = variantTwo[p - 1];
            generatedSequenceVariants.push(variantTwo.join(''));
        }
    }

    for (const sequenceCandidate of generatedSequenceVariants) {
        const finalProcessedSequence = eliminateConsecutiveGroups(sequenceCandidate);
        if (finalProcessedSequence.length < shortestLengthFound) {
            shortestLengthFound = finalProcessedSequence.length;
        }
    }

    return shortestLengthFound;
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLinesArray = rawInputContent.trim().split('\n');

let linePointer = 0;
const collectedResults = [];

while (true) {
    const numberOfItems = parseInt(inputLinesArray[linePointer++], 10);
    if (numberOfItems === 0) {
        break;
    }

    const currentItems = [];
    for (let q = 0; q < numberOfItems; q++) {
        currentItems.push(parseInt(inputLinesArray[linePointer++], 10));
    }

    const caseOutcome = processTestCase(currentItems);
    collectedResults.push(caseOutcome);
}

collectedResults.forEach(singleResult => console.log(singleResult));