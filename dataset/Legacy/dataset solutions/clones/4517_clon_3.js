const isHomogeneous = (strValue) => {
    return /^([a-z])\1*$/.test(strValue);
};

const performStringTransformation = (sourceStr, charToMatch) => {
    let resultStr = "";
    const processingLimit = sourceStr.length - 1;

    for (let charIdx = 0; charIdx < processingLimit; charIdx++) {
        const charAtCurrentPosition = sourceStr.charAt(charIdx);
        const charAtNextPosition = sourceStr.charAt(charIdx + 1);

        if (charToMatch === charAtCurrentPosition) {
            resultStr += charToMatch;
        } else if (charToMatch === charAtNextPosition) {
            resultStr += charToMatch;
        } else {
            resultStr += charAtCurrentPosition;
        }
    }
    return resultStr;
};

function processInputString(rawData) {
    const inputLines = rawData.split("\n");
    let initialTargetString = inputLines[0];

    let minimumAttempts = -1;

    const CHAR_CODE_LOWER_A = "a".charCodeAt(0);
    const CHAR_CODE_LOWER_Z = "z".charCodeAt(0);

    for (let charCodeIterator = CHAR_CODE_LOWER_A; charCodeIterator <= CHAR_CODE_LOWER_Z; charCodeIterator++) {
        const currentComparisonChar = String.fromCharCode(charCodeIterator);

        if (isHomogeneous(initialTargetString)) {
            minimumAttempts = 0;
            break;
        }

        let currentWorkingString = initialTargetString;
        let currentIterationCount = 0;

        while (true) {
            const transformedResultString = performStringTransformation(currentWorkingString, currentComparisonChar);

            currentIterationCount++;

            console.log(transformedResultString);

            if (isHomogeneous(transformedResultString)) {
                break;
            }

            currentWorkingString = transformedResultString;
        }

        if (minimumAttempts === -1 || currentIterationCount < minimumAttempts) {
            minimumAttempts = currentIterationCount;
        }
    }

    console.log(minimumAttempts);
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
