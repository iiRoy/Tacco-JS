const processSequenceForBombs = (inputSequence) => {
    let currentProcessedString = inputSequence;
    let previousStringLength;

    do {
        previousStringLength = currentProcessedString.length;
        const characterCountStack = []; // Stores [character, count] pairs

        for (const charUnit of currentProcessedString) {
            if (characterCountStack.length > 0 && characterCountStack[characterCountStack.length - 1][0] === charUnit) {
                characterCountStack[characterCountStack.length - 1][1]++;
            } else {
                characterCountStack.push([charUnit, 1]);
            }

            // Check for bomb condition immediately after updating the stack
            // This handles cascading removals
            if (characterCountStack.length > 0) {
                const lastStackEntry = characterCountStack[characterCountStack.length - 1];
                if (lastStackEntry[1] >= 4 && (lastStackEntry[0] === '1' || lastStackEntry[0] === '2' || lastStackEntry[0] === '3')) {
                    characterCountStack.pop(); // Remove the bombed sequence
                }
            }
        }
        // Reconstruct the string from the stack for the next iteration
        currentProcessedString = characterCountStack.map(pair => pair[0].repeat(pair[1])).join('');

    } while (currentProcessedString.length !== previousStringLength); // Continue until no more bombs can be removed

    return currentProcessedString.length;
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputDataLines = rawInputContent.trim().split('\n');

let currentLineIndex = 0;
const allTestCases = [];

// Parse all test cases from input
while (currentLineIndex < inputDataLines.length) {
    const sequenceLength = parseInt(inputDataLines[currentLineIndex++], 10);
    if (sequenceLength === 0) break;

    const initialNumericValues = [];
    for (let k = 0; k < sequenceLength; k++) {
        initialNumericValues.push(parseInt(inputDataLines[currentLineIndex++], 10));
    }
    allTestCases.push({ sequenceLength, initialNumericValues });
}

// Process each parsed test case
allTestCases.forEach(currentCaseData => {
    const { sequenceLength, initialNumericValues } = currentCaseData;
    let overallMinimumLength = Infinity;
    const originalSequenceString = initialNumericValues.join('');

    // Iterate through all possible modification indices
    Array.from({ length: sequenceLength }, (_, modificationPosition) => {
        let candidateStringVariantA;
        let candidateStringVariantB;

        // Construct candidateStringVariantA: element at modificationPosition takes value of next element
        if (modificationPosition < sequenceLength - 1) {
            candidateStringVariantA = originalSequenceString.substring(0, modificationPosition) +
                                      originalSequenceString[modificationPosition + 1] +
                                      originalSequenceString.substring(modificationPosition + 1);
        } else {
            // If it's the last element, it remains unchanged as there's no next element
            candidateStringVariantA = originalSequenceString;
        }

        // Construct candidateStringVariantB: element at modificationPosition takes value of previous element
        if (modificationPosition > 0) {
            candidateStringVariantB = originalSequenceString.substring(0, modificationPosition) +
                                      originalSequenceString[modificationPosition - 1] +
                                      originalSequenceString.substring(modificationPosition + 1);
        } else {
            // If it's the first element, it remains unchanged as there's no previous element
            candidateStringVariantB = originalSequenceString;
        }

        overallMinimumLength = Math.min(overallMinimumLength, processSequenceForBombs(candidateStringVariantA));
        overallMinimumLength = Math.min(overallMinimumLength, processSequenceForBombs(candidateStringVariantB));
    });

    console.log(overallMinimumLength);
});
