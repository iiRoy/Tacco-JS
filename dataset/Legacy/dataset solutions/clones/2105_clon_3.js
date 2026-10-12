function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    let currentString = inputLines[0];
    let directionState = 1;

    const applyStringModification = (targetStr, segmentToAdd, shouldAppend) => {
        if (shouldAppend) {
            return targetStr + segmentToAdd;
        } else {
            return segmentToAdd + targetStr;
        }
    };

    for (let lineIndex = 1; lineIndex < inputLines.length; lineIndex++) {
        const currentOperationParts = inputLines[lineIndex].split(" ");
        const operationTypeIdentifier = parseInt(currentOperationParts[0], 10);

        if (operationTypeIdentifier === 1) {
            directionState *= -1;
        } else {
            const modificationMode = parseInt(currentOperationParts[1], 10);
            const stringSegmentValue = currentOperationParts[2];

            let isAppendOperation;
            if (modificationMode === 1) {
                isAppendOperation = (directionState === 1);
            } else { // modificationMode === 2
                isAppendOperation = (directionState === -1);
            }

            currentString = applyStringModification(currentString, stringSegmentValue, isAppendOperation);
        }
    }

    if (directionState === -1) {
        console.log(currentString);
    } else {
        const finalReversedString = currentString.split("").reverse().join("");
        console.log(finalReversedString);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
