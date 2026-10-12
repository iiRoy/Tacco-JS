const evaluateCharacterPattern = (charOne, charTwo, charThree, charFour) => {
    const areFirstTwoIdentical = (charOne === charTwo);
    const areLastTwoIdentical = (charThree === charFour);
    const arePairsDistinct = (charOne !== charThree);

    return areFirstTwoIdentical && areLastTwoIdentical && arePairsDistinct;
};

function processInputString(sourceData) {
    const normalizedInput = String(sourceData).trim();

    const charArrayFromInput = [...normalizedInput.split('')];

    charArrayFromInput.sort();

    const [sortedCharA, sortedCharB, sortedCharC, sortedCharD] = charArrayFromInput;

    const isSpecificPatternPresent = evaluateCharacterPattern(sortedCharA, sortedCharB, sortedCharC, sortedCharD);

    if (isSpecificPatternPresent) {
        console.log('Yes');
    } else {
        console.log('NO');
    }
}

const fileSystemUtility = require('fs');
const standardInputPath = "/dev/stdin";
const fileReadEncoding = "utf8";

const inputBufferContent = fileSystemUtility.readFileSync(standardInputPath, fileReadEncoding);
processInputString(inputBufferContent.toString());
