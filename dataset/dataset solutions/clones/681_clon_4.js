function* lineStream(sourceContent) {
    const contentLines = sourceContent.trim().split('\n');
    let currentLineIndex = 0;
    while (currentLineIndex < contentLines.length) {
        yield contentLines[currentLineIndex++];
    }
}

function locateFirstExceedingIndex(orderedList, searchBegin, comparisonValue) {
    let lowerBound = searchBegin;
    let upperBound = orderedList.length - 1;
    let foundPosition = -1;

    while (lowerBound <= upperBound) {
        const middlePoint = Math.floor((lowerBound + upperBound) / 2);
        if (orderedList[middlePoint] > comparisonValue) {
            foundPosition = middlePoint;
            upperBound = middlePoint - 1;
        } else {
            lowerBound = middlePoint + 1;
        }
    }
    return foundPosition;
}

const sourceText = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineConsumer = lineStream(sourceText);

let currentSegment;
while ((currentSegment = lineConsumer.next().value) !== undefined) {
    const [elementCount, sumThreshold] = currentSegment.split(' ').map(Number);

    if (elementCount === 0 && sumThreshold === 0) {
        break;
    }

    const numericSequence = Array.from({ length: elementCount }, () =>
        Number(lineConsumer.next().value)
    );

    numericSequence.sort((valA, valB) => valA - valB);

    const pairTally = numericSequence.slice(0, elementCount - 1).reduce((currentTally, firstTerm, firstTermIndex) => {
        const minimumSecondTerm = sumThreshold - firstTerm;
        const validSecondTermStart = locateFirstExceedingIndex(numericSequence, firstTermIndex + 1, minimumSecondTerm);

        if (validSecondTermStart !== -1) {
            return currentTally + (elementCount - validSecondTermStart);
        }
        return currentTally;
    }, 0);

    console.log(pairTally);
}
