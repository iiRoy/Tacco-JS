function processString(inputSequence) {
    const sequenceElements = inputSequence.split('');
    const sequenceLength = sequenceElements.length;
    let distinctSubsequenceCount = 0;

    function buildSubsequences(currentIndex, currentAccumulator) {
        if (currentIndex === sequenceLength) {
            if (currentAccumulator.length === 0) {
                return;
            }

            const visitedChars = new Set();
            let hasDuplicateCharacters = false;
            for (const charItem of currentAccumulator) {
                if (visitedChars.has(charItem)) {
                    hasDuplicateCharacters = true;
                    break;
                }
                visitedChars.add(charItem);
            }

            if (!hasDuplicateCharacters) {
                distinctSubsequenceCount++;
            }
            return;
        }

        buildSubsequences(currentIndex + 1, currentAccumulator);
        buildSubsequences(currentIndex + 1, currentAccumulator + sequenceElements[currentIndex]);
    }

    buildSubsequences(0, '');

    return distinctSubsequenceCount;
}

function executeProgram(inputDataPayload) {
    const inputLines = inputDataPayload.split('\n');
    const firstLineValue = inputLines[0];
    const targetString = inputLines[1];

    const resultValue = processString(targetString);
    console.log(resultValue);
}

const fileSystemUtility = require('fs');
const standardInputPath = '/dev/stdin';
const rawInputContent = fileSystemUtility.readFileSync(standardInputPath, 'utf8');
executeProgram(rawInputContent);