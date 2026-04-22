const removeLongConsecutiveDigits = (sourceText) => {
    let resultBuffer = [];
    let processingIndex = 0;
    while (processingIndex < sourceText.length) {
        let currentCharacter = sourceText[processingIndex];
        let consecutiveCount = 0;
        let scanForwardIndex = processingIndex;
        while (scanForwardIndex < sourceText.length && sourceText[scanForwardIndex] === currentCharacter) {
            consecutiveCount++;
            scanForwardIndex++;
        }
        if (consecutiveCount < 4) {
            for (let k = 0; k < consecutiveCount; k++) {
                resultBuffer.push(currentCharacter);
            }
        }
        processingIndex = scanForwardIndex;
    }
    return resultBuffer.join('');
};

const determineFinalLength = (initialText) => {
    let previousVersion;
    let currentVersion = initialText;
    do {
        previousVersion = currentVersion;
        currentVersion = removeLongConsecutiveDigits(previousVersion);
    } while (currentVersion.length !== previousVersion.length);
    return currentVersion.length;
};

const entireInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = entireInput.trim().split('\n');

let currentLinePointer = 0;

while (true) {
    const numberOfElements = parseInt(processedLines[currentLinePointer++]);

    if (numberOfElements === 0) {
        break;
    }

    let digitArray = [];
    for (let j = 0; j < numberOfElements; j++) {
        digitArray.push(parseInt(processedLines[currentLinePointer++]));
    }

    let minimumAchievedLength = Number.POSITIVE_INFINITY;

    for (let modificationIndex = 0; modificationIndex < numberOfElements; modificationIndex++) {
        let firstModifiedArray = [...digitArray];
        if (modificationIndex < numberOfElements - 1) {
            firstModifiedArray[modificationIndex] = firstModifiedArray[modificationIndex + 1];
        }
        const firstStringForm = firstModifiedArray.join('');
        const lengthAfterFirstReduction = determineFinalLength(firstStringForm);
        minimumAchievedLength = Math.min(minimumAchievedLength, lengthAfterFirstReduction);

        let secondModifiedArray = [...digitArray];
        if (modificationIndex > 0) {
            secondModifiedArray[modificationIndex] = secondModifiedArray[modificationIndex - 1];
        }
        const secondStringForm = secondModifiedArray.join('');
        const lengthAfterSecondReduction = determineFinalLength(secondStringForm);
        minimumAchievedLength = Math.min(minimumAchievedLength, lengthAfterSecondReduction);
    }

    console.log(minimumAchievedLength);
}