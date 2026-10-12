const checkArrayForDuplicates = (arr) => {
    const seenElements = new Set();
    for (const element of arr) {
        if (seenElements.has(element)) {
            return true;
        }
        seenElements.add(element);
    }
    return false;
};

function processStringCombinations(inputStr) {
    const stringLength = inputStr.length;
    const charArray = inputStr.split("");
    let uniqueSubsequenceCounter = 0;

    const minCombinationValue = Math.pow(2, stringLength);
    const maxCombinationValue = Math.pow(2, stringLength + 1) - 1;

    for (let combinationIdx = minCombinationValue; combinationIdx <= maxCombinationValue; combinationIdx++) {
        const binaryRepresentation = combinationIdx.toString(2);
        const selectionPattern = binaryRepresentation
            .slice(-stringLength)
            .split("")
            .reverse()
            .map(Number);

        let currentSubsequence = [];
        for (let charIdx = 0; charIdx < stringLength; charIdx++) {
            if (selectionPattern[charIdx] === 1) {
                currentSubsequence.push(charArray[charIdx]);
            }
        }

        if (currentSubsequence.length === 0) {
            continue;
        }

        if (checkArrayForDuplicates(currentSubsequence)) {
            continue;
        }

        uniqueSubsequenceCounter++;
    }

    return uniqueSubsequenceCounter;
}

function executeProgram(programArgs) {
    const lines = programArgs.split("\n");
    const targetString = lines[1];

    console.log(processStringCombinations(targetString));
}

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
