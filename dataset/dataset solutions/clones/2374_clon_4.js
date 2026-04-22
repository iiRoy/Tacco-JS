function retrieveTokens(entireInput) {
    const allSegments = entireInput.split(/\s+/);
    let segmentPointer = 0;
    return () => allSegments[segmentPointer++];
}

function calculateUniqueCombinations(parameters) {
    const currentLength = parameters.sizeIndicator;
    const digitCollection = parameters.numberSequence;

    const firstCharSet = new Set();
    const secondCharSet = new Set();
    const thirdCharSet = new Set();

    for (let indexPosition = 0; indexPosition < currentLength; ++indexPosition) {
        const currentCharacterValue = digitCollection[indexPosition];

        for (const twoCharacterPrefix of secondCharSet) {
            thirdCharSet.add(twoCharacterPrefix + currentCharacterValue);
        }

        for (const oneCharacterPrefix of firstCharSet) {
            secondCharSet.add(oneCharacterPrefix + currentCharacterValue);
        }
        
        firstCharSet.add(currentCharacterValue);
    }

    return thirdCharSet.size;
}

function initiateProcessing(inputStringFromSource) {
    const getNextToken = retrieveTokens(inputStringFromSource);
    const sequenceSize = Number(getNextToken());
    const inputDigits = getNextToken();

    const dataPayload = {
        sizeIndicator: sequenceSize,
        numberSequence: inputDigits
    };

    const finalCount = calculateUniqueCombinations(dataPayload);
    console.log(finalCount);
}

const fileSystemUtility = require('fs');
const standardInputContent = fileSystemUtility.readFileSync("/dev/stdin", "utf8");
initiateProcessing(standardInputContent);