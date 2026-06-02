const countSpecificChar = (targetString, charToFind) => {
    let charCount = 0;
    for (let charIndex = 0; charIndex < targetString.length; charIndex++) {
        if (targetString[charIndex] === charToFind) {
            charCount++;
        }
    }
    return charCount;
};

const processInput = (rawData) => {
    const NEWLINE_DELIMITER = '\n';
    const EMPTY_STRING = '';
    const TARGET_CHAR_W = 'W';
    const TARGET_CHAR_E = 'E';
    const INITIAL_MIN_MISMATCHES = 3 * 100000;

    let inputLines = rawData.split(NEWLINE_DELIMITER);
    const stringLength = parseInt(inputLines.shift(), 10);
    const fullSequence = inputLines.join(EMPTY_STRING);

    let minimumMismatches = INITIAL_MIN_MISMATCHES;

    for (let splitPointIndex = 1; splitPointIndex < stringLength; splitPointIndex++) {
        const leftSegment = fullSequence.slice(0, splitPointIndex);
        const rightSegment = fullSequence.slice(splitPointIndex + 1, stringLength);

        const esInLeftSegment = countSpecificChar(leftSegment, TARGET_CHAR_E);
        const wsInRightSegment = countSpecificChar(rightSegment, TARGET_CHAR_W);

        const currentMismatchCount = esInLeftSegment + wsInRightSegment;

        if (currentMismatchCount === 0) {
            minimumMismatches = 0;
            break;
        } else if (currentMismatchCount < minimumMismatches) {
            minimumMismatches = currentMismatchCount;
        }
    }

    console.log(minimumMismatches);
    return 0;
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
