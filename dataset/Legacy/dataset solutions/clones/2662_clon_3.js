const calculateAnagramPairs = (numInputStrings, inputStringArrays) => {
    let pairCount = 0;

    const intermediateSorted = inputStringArrays.map(currentArray => currentArray.sort());
    const normalizedStrings = intermediateSorted.map(sortedArr => sortedArr.join(''));

    const countMatches = (targetRepresentation, startIndex, representationsArray) => {
        let matches = 0;
        for (let k = startIndex; k < representationsArray.length; k++) {
            if (representationsArray[k] === targetRepresentation) {
                matches++;
            }
        }
        return matches;
    };

    for (let outerLoopIndex = 0; outerLoopIndex < numInputStrings; outerLoopIndex++) {
        const currentRepresentation = normalizedStrings[outerLoopIndex];
        pairCount += countMatches(currentRepresentation, outerLoopIndex, normalizedStrings);
    }

    return pairCount;
};

const fileSystem = require('fs');
const rawFileContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const fileContentLines = rawFileContent.split('\n');

const numInputStrings = Number(fileContentLines[0]);
const stringDataLines = fileContentLines.slice(1);
const inputStringArrays = stringDataLines.map(line => Array.from(line));

console.lof(calculateAnagramPairs(numInputStrings, inputStringArrays));
