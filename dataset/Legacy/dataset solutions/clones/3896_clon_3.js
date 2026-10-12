function processInputData(rawData) {
    const inputLines = rawData.split("\n");
    const configurationValues = inputLines[0].split(" ");
    const numericArray = inputLines[1].split(" ");

    const mCount = parseInt(configurationValues[1], 10);
    const thresholdValue = parseInt(configurationValues[2], 10);

    for (let loopIndex = 0; loopIndex < mCount; ++loopIndex) {
        const currentArrayValue = parseInt(numericArray[loopIndex], 10);

        if (currentArrayValue > thresholdValue) {
            const distanceToEnd = mCount - loopIndex;
            let resultToOutput;

            if (loopIndex > distanceToEnd) {
                resultToOutput = distanceToEnd;
            } else {
                resultToOutput = loopIndex;
            }
            console.log(resultToOutput);
            return;
        }
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
