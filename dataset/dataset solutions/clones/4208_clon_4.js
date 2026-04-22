const extractSequence = (fullInput) => {
    let sequence = [];
    for (let currentPos = 0; currentPos < fullInput.length; currentPos++) {
        if (fullInput[currentPos] === '\n') {
            break;
        }
        sequence.push(fullInput[currentPos]);
    }
    return sequence;
};

const computeCardinality = (elementSeries) => {
    let knownElements = new Map();
    for (let item of elementSeries) {
        knownElements.set(item, true);
    }
    return knownElements.size;
};

const compareSegments = (collection, startPointer, endPointer) => {
    if (startPointer >= endPointer) {
        return true;
    }
    if (collection[startPointer] !== collection[endPointer]) {
        return false;
    }
    return compareSegments(collection, startPointer + 1, endPointer - 1);
};

const analyzePattern = (initialText) => {
    const characterCollection = extractSequence(initialText);
    const collectionSize = characterCollection.length;
    const distinctCount = computeCardinality(characterCollection);

    if (distinctCount === 1 && collectionSize > 1) {
        return "NO";
    }

    if (distinctCount === 2 && collectionSize === 2) {
        return "YES";
    }

    if (distinctCount === 3) {
        return "YES";
    }

    if (collectionSize % 2 !== 0) {
        const middleOffset = Math.floor(collectionSize / 2);
        if (compareSegments(characterCollection, 0, collectionSize - 1)) {
            let firstSubsegment = [];
            for (let i = 0; i < middleOffset; i++) {
                firstSubsegment.push(characterCollection[i]);
            }
            if (computeCardinality(firstSubsegment) === 1) {
                return "NO";
            }
        }
    }

    return "YES";
};

const initiateProcess = (dataSource) => {
    const outcomeMessage = analyzePattern(dataSource);
    console.log(outcomeMessage);
};

initiateProcess(require("fs").readFileSync("/dev/stdin", "utf8"));