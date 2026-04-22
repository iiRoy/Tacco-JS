const processStringForValidity = (inputSource) => {
    const processedString = inputSource.trim();
    const characterSequence = Array.from(processedString);
    const sequenceLength = characterSequence.length;

    const isCapitalA = (char, idx) => idx === 0 && char === 'A';
    const isCapitalCInMiddle = (char, idx) => char === 'C' && idx >= 2 && idx <= sequenceLength - 2;
    const isLowercaseChar = (char) => {
        const charCode = char.charCodeAt(0);
        return charCode >= 97 && charCode <= 122;
    };

    const firstCharCheck = isCapitalA(characterSequence[0], 0);

    const middleCIndices = characterSequence.map((char, idx) => isCapitalCInMiddle(char, idx) ? idx : -1)
                                            .filter(idx => idx !== -1);
    const middleCCountCheck = middleCIndices.length === 1;
    const cPositionInMiddle = middleCCountCheck ? middleCIndices[0] : -1;

    const remainingCharsCheck = characterSequence.every((char, idx) => {
        if (idx === 0) return true;
        if (idx === cPositionInMiddle) return true;
        return isLowercaseChar(char);
    });

    const overallValidity = firstCharCheck && middleCCountCheck && remainingCharsCheck;

    return overallValidity;
};

const executeCheck = (inputData) => {
    if (processStringForValidity(inputData)) {
        console.log('AC');
    } else {
        console.log('WA');
    }
};

executeCheck(require("fs").readFileSync("/dev/stdin", "utf8"));