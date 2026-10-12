function processInput(rawData) {
    const lineSeparator = '\n';
    const valueSeparator = ' ';
    const divisorValue = 2.0;

    const inputLines = rawData.split(lineSeparator);

    const elementCount = parseInt(inputLines[0], 10);

    let numericValues = inputLines[1].split(valueSeparator).map(parseFloat);

    numericValues.sort((valA, valB) => valA - valB);

    let currentAverageResult;

    while (numericValues.length > 1) {
        const smallestValue = numericValues.shift();
        const nextSmallestValue = numericValues.shift();
        
        currentAverageResult = (smallestValue + nextSmallestValue) / divisorValue;
        numericValues.unshift(currentAverageResult);
    }

    console.log(numericValues[0]);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
