const fileSystem = require('fs');

let rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let processingQueue = rawInputData.trim().split("\n");

while (true) {
    if (processingQueue.length === 0) {
        break;
    }

    let firstLineContent = processingQueue.shift();
    let secondLineContent = processingQueue.shift();

    let firstStringCharacters = firstLineContent.split("");
    let secondStringCharacters = secondLineContent.split("");

    let maximumMatchLength = 0;
    let currentComparisonWindowSize = 0;

    const firstStringLastValidIndex = firstStringCharacters.length - 1;

    for (let firstStringStartingPoint = firstStringLastValidIndex; firstStringStartingPoint >= 0; firstStringStartingPoint--) {
        currentComparisonWindowSize++;

        let currentFirstStringTraversalIndex = firstStringStartingPoint;
        let consecutiveMatchCount = 0;

        for (let secondStringPrefixIndex = 0; secondStringPrefixIndex < currentComparisonWindowSize; secondStringPrefixIndex++) {
            const charFromFirstString = firstStringCharacters[currentFirstStringTraversalIndex];
            const charFromSecondString = secondStringCharacters[secondStringPrefixIndex];

            if (charFromFirstString === charFromSecondString) {
                consecutiveMatchCount++;
            } else {
                maximumMatchLength = Math.max(maximumMatchLength, consecutiveMatchCount);
                consecutiveMatchCount = 0;
            }
            currentFirstStringTraversalIndex++;
        }
    }
    console.log(maximumMatchLength);
}
