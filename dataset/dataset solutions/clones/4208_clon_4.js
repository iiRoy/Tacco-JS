const getUniqueCharacterCount = (charSequence) => {
    const characterPresence = {};
    let uniqueCount = 0;
    for (let i = 0; i < charSequence.length; i++) {
        const currentCharacter = charSequence[i];
        if (!characterPresence[currentCharacter]) {
            characterPresence[currentCharacter] = true;
            uniqueCount++;
        }
    }
    return uniqueCount;
};

const evaluateOddPalindromeCondition = (charSequence) => {
    const sequenceLength = charSequence.length;

    if (sequenceLength % 2 === 0) {
        return false;
    }

    const midPoint = Math.floor(sequenceLength / 2);
    let leftCursor = 0;
    let rightCursor = sequenceLength - 1;

    while (leftCursor < midPoint) {
        if (charSequence[leftCursor] !== charSequence[rightCursor]) {
            return false;
        }
        leftCursor++;
        rightCursor--;
    }

    const leftHalfUniqueTracker = {};
    let distinctLeftHalfCount = 0;
    for (let i = 0; i < midPoint; i++) {
        const charInHalf = charSequence[i];
        if (!leftHalfUniqueTracker[charInHalf]) {
            leftHalfUniqueTracker[charInHalf] = true;
            distinctLeftHalfCount++;
        }
    }
    return distinctLeftHalfCount === 1;
};

function analyzeStringPattern(inputContent) {
    const processedLine = inputContent.split('\n')[0];
    const characterArray = processedLine.split('');
    const currentLength = characterArray.length;
    const distinctCharacters = getUniqueCharacterCount(characterArray);

    if (distinctCharacters === 1 && currentLength > 1) {
        return "NO";
    }

    if (distinctCharacters === 2 && currentLength === 2) {
        return "YES";
    }

    if (distinctCharacters === 3) {
        return "YES";
    }

    if (currentLength % 2 === 0) {
        return "YES";
    }

    if (evaluateOddPalindromeCondition(characterArray)) {
        return "NO";
    }

    return "YES";
}

console.log(analyzeStringPattern(require("fs").readFileSync("/dev/stdin", "utf8")));
