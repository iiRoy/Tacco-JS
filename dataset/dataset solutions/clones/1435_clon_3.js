const performStringRotation = (sourceString, splitPoint) => {
    const partAfterSplit = sourceString.slice(splitPoint);
    const partBeforeSplit = sourceString.slice(0, splitPoint);
    return partAfterSplit + partBeforeSplit;
};

const retrieveAndConvertToInt = (tokenArray) => {
    const nextTokenValue = tokenArray.shift();
    return parseInt(nextTokenValue, 10);
};

function processInputDataStream (rawInputContent) {
    const END_OF_SEQUENCE_MARKER = "-";

    const cleanedInputContent = rawInputContent.trim();
    const dataTokens = cleanedInputContent.split(/\s|\n/);

    while (true) {
        let currentWorkingString = dataTokens.shift();

        if (currentWorkingString === END_OF_SEQUENCE_MARKER) {
            break;
        }

        const numberOfRotations = retrieveAndConvertToInt(dataTokens);

        for (let rotationIteration = 0; rotationIteration < numberOfRotations; rotationIteration++) {
            const rotationCutPoint = retrieveAndConvertToInt(dataTokens);
            currentWorkingString = performStringRotation(currentWorkingString, rotationCutPoint);
        }

        console.log(currentWorkingString);
    }
}

processInputDataStream(require("fs").readFileSync("/dev/stdin", "utf8"));
