const acquireHeadCharacter = (inputSequence) => {
    const sequenceAsArray = Array.from(inputSequence);
    return sequenceAsArray.length > 0 ? sequenceAsArray[0] : '';
};

const acquireTailCharacter = (inputSequence) => {
    const sequenceAsArray = Array.from(inputSequence);
    return sequenceAsArray.length > 0 ? sequenceAsArray[sequenceAsArray.length - 1] : '';
};

const calculateLengthRecursively = (str, currentIdx = 0) => {
    if (currentIdx >= str.length) {
        return 0;
    }
    return 1 + calculateLengthRecursively(str, currentIdx + 1);
};

const deriveInnerCount = (inputSequence) => {
    const totalLength = calculateLengthRecursively(inputSequence);
    return totalLength - 2;
};

const assembleFinalString = (originalInput) => {
    const firstPart = acquireHeadCharacter(originalInput);
    const middlePart = deriveInnerCount(originalInput);
    const lastPart = acquireTailCharacter(originalInput);

    return [firstPart, middlePart, lastPart].join('');
};

(function orchestrateProcessing() {
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const outcome = assembleFinalString(rawContent);
    console.log(outcome);
})();