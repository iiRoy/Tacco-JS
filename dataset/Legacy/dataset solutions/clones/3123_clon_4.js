function processString(inputSequence) {
    const sequenceLength = inputSequence.length;
    let uniqueSubsequenceCount = 0;

    const hasDistinctElements = (charArray) => {
        if (charArray.length === 0) {
            return false;
        }
        const elementTracker = new Set();
        for (const element of charArray) {
            if (elementTracker.has(element)) {
                return false;
            }
            elementTracker.add(element);
        }
        return true;
    };

    const generateAndEvaluate = (currentPosition, accumulatedCharacters) => {
        if (currentPosition === sequenceLength) {
            if (hasDistinctElements(accumulatedCharacters)) {
                uniqueSubsequenceCount++;
            }
            return;
        }

        generateAndEvaluate(currentPosition + 1, accumulatedCharacters);

        generateAndEvaluate(currentPosition + 1, [...accumulatedCharacters, inputSequence[currentPosition]]);
    };

    generateAndEvaluate(0, []);

    return uniqueSubsequenceCount;
}

function mainProcessor(inputData) {
    const inputLines = inputData.split("\n");
    const targetString = inputLines[1];

    console.log(processString(targetString));
}

mainProcessor(require('fs').readFileSync('/dev/stdin', 'utf8'));
