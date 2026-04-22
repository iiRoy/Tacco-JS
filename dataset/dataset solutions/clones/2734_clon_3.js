const processInputData = (rawDataString) => {
    let parsedLines = rawDataString.split('\n');

    const operationCount = parseInt(parsedLines[0], 10);

    parsedLines.shift();

    const numericalDataSet = parsedLines.map(Number);

    if (isNaN(operationCount) || operationCount <= 0) {
        console.error("Invalid or non-positive operation count provided. Exiting.");
        return;
    }

    for (let currentProcessingIndex = 0; currentProcessingIndex < operationCount; currentProcessingIndex++) {
        let temporarySubset = [...numericalDataSet];

        temporarySubset.splice(currentProcessingIndex, 1);

        if (temporarySubset.length === 0) {
            console.log("No elements remaining after exclusion.");
            continue;
        }

        const highestValueInSubset = Math.max(...temporarySubset);

        console.log(highestValueInSubset);
    }
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));