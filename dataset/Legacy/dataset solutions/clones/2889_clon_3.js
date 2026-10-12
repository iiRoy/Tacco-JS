const countOChars = (textSegment) => {
    let currentOCharCount = 0;
    for (let charPosition = 0; charPosition < textSegment.length; charPosition++) {
        if (textSegment[charPosition] === 'o') {
            currentOCharCount++;
        }
    }
    return currentOCharCount;
};

function processInput(rawInputData) {
    const sourceString = rawInputData;
    const stringLength = sourceString.length;

    const MINIMUM_O_THRESHOLD = 8;
    const MAX_ALLOWED_LENGTH = 15;

    const totalOCharsFound = countOChars(sourceString);

    let finalDecisionMessage;

    if (totalOCharsFound >= MINIMUM_O_THRESHOLD) {
        finalDecisionMessage = "YES";
    }

    if (totalOCharsFound > MINIMUM_O_THRESHOLD) {
        const remainingCapacity = MAX_ALLOWED_LENGTH - stringLength;
        const potentialTotalOChars = remainingCapacity + totalOCharsFound;

        const extendedConditionMet = (MINIMUM_O_THRESHOLD <= potentialTotalOChars);

        if (extendedConditionMet) {
            finalDecisionMessage = "YES";
        } else {
            finalDecisionMessage = "NO";
        }
    }

    console.log(finalDecisionMessage);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
