function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const totalItemsCount = Number(inputLines[0]);

    const inputNumbersArray = inputLines[1].split(" ").map(itemStr => Number(itemStr));

    const distinctValuesCollection = new Set(inputNumbersArray);

    const distinctCount = distinctValuesCollection.size;

    const outputLines = [];

    outputLines.push(totalItemsCount);

    for (let currentDivisor = 2; currentDivisor <= totalItemsCount; currentDivisor++) {
        let calculatedValue;

        if (distinctCount < currentDivisor) {
            calculatedValue = 0;
        } else {
            calculatedValue = Math.floor(distinctCount / currentDivisor);
        }
        outputLines.push(calculatedValue);
    }

    console.log(outputLines.join("\n").toString());

    return;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
