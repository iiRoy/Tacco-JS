const readAndProcessInput = () => {
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    return rawInputContent.split("\n").map(valueStr => parseInt(valueStr, 10));
};

const hasDifferentParity = (firstVal, secondVal) => {
    return (firstVal % 2) !== (secondVal % 2);
};

const inputSequence = readAndProcessInput();

const processMainSequence = () => {
    const NO_MATCH_FOUND = "No";
    const ALL_MATCHED = "Yes";

    const sequenceCount = inputSequence[0];
    const visitedIndices = {};
    let currentPosition = 1;

    while (currentPosition <= sequenceCount) {
        const currentSequenceValue = inputSequence[currentPosition];

        if (hasDifferentParity(currentSequenceValue, currentPosition)) {
            return NO_MATCH_FOUND;
        }

        let currentUpperLimit = currentSequenceValue;
        let currentLowerLimit = currentPosition;
        visitedIndices[currentUpperLimit] = true;

        while (currentPosition < currentUpperLimit) {
            currentPosition++;
            const nextValueInSequence = inputSequence[currentPosition];

            if (nextValueInSequence !== currentPosition) {
                return NO_MATCH_FOUND;
            }

            currentPosition++;
            const valueAfterNext = inputSequence[currentPosition];

            if (hasDifferentParity(valueAfterNext, currentPosition)) {
                return NO_MATCH_FOUND;
            }

            if (currentUpperLimit < valueAfterNext) {
                currentUpperLimit = valueAfterNext;
                visitedIndices[currentUpperLimit] = true;
            } else if (currentLowerLimit === valueAfterNext) {
                let candidateLowerLimit = currentLowerLimit;
                do {
                    candidateLowerLimit += 2;
                } while (visitedIndices[candidateLowerLimit]);
                currentLowerLimit = candidateLowerLimit;
            } else {
                return NO_MATCH_FOUND;
            }
        }
        currentPosition++;
    }
    return ALL_MATCHED;
};

console.log(processMainSequence());
