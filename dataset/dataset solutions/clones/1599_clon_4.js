function assessConfiguration(dimensionA, dimensionB, dimensionC) {
    const uniqueCheck = new Set([dimensionA, dimensionB, dimensionC]).size === 3;
    if (!uniqueCheck) {
        return false;
    }
    const sortedDimensions = [dimensionA, dimensionB, dimensionC].sort((p, q) => p - q);
    return sortedDimensions[0] + sortedDimensions[1] > sortedDimensions[2];
}

function analyzeDimensions(inputPayload) {
    const segmentCount = +inputPayload.match(/^\d+/)[0];
    const dimensionList = inputPayload.split('\n')[1].match(/\d+/g).map(Number);

    let validConfigurations = 0;

    function selectIndices(startPosition, chosenIndices) {
        if (chosenIndices.length === 3) {
            const val1 = dimensionList[chosenIndices[0]];
            const val2 = dimensionList[chosenIndices[1]];
            const val3 = dimensionList[chosenIndices[2]];

            if (assessConfiguration(val1, val2, val3)) {
                validConfigurations++;
            }
            return;
        }

        if (startPosition >= segmentCount) {
            return;
        }

        selectIndices(startPosition + 1, [...chosenIndices, startPosition]);

        selectIndices(startPosition + 1, chosenIndices);
    }

    selectIndices(0, []);

    console.log(validConfigurations);
}

analyzeDimensions(require("fs").readFileSync("/dev/stdin", "utf8"));