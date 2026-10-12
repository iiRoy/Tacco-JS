module.exports = (() => {
    const fileSystemAccess = require("fs");
    const rawInputData = fileSystemAccess.readFileSync("/dev/stdin", "utf8");

    const createInputSource = (sourceString) => {
        const dataTokens = sourceString.trim().split(/\s+/g);
        let currentPosition = 0;

        const retrieveNextToken = () => {
            if (currentPosition >= dataTokens.length) {
                return undefined;
            }
            return dataTokens[currentPosition++];
        };

        return {
            extractRaw: retrieveNextToken,
            extractInteger: () => parseInt(retrieveNextToken(), 10),
        };
    };

    const executeProcessing = (inputSource) => {
        const totalElements = inputSource.extractInteger();
        const elementValues = Array.from({ length: totalElements }, () => inputSource.extractInteger());

        const consecutiveCounts = {};
        consecutiveCounts[0] = 0;

        for (let sequenceIndex = 1; sequenceIndex <= totalElements; ++sequenceIndex) {
            const currentItem = (sequenceIndex < totalElements) ? elementValues[sequenceIndex] : undefined;
            const previousItem = currentItem - 1;

            consecutiveCounts[currentItem] = consecutiveCounts[previousItem] + 1;
        }

        let maxSequenceLength = 0;
        for (let checkValue = 1; checkValue <= totalElements; ++checkValue) {
            maxSequenceLength = Math.max(maxSequenceLength, consecutiveCounts[checkValue]);
        }

        console.log(totalElements - maxSequenceLength);
    };

    const inputProcessorInstance = createInputSource(rawInputData);
    executeProcessing(inputProcessorInstance);
})();
