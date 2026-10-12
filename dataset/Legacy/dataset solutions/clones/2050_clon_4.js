function processInputData(rawData) {
    const inputLines = rawData.split("\n");
    const numberTokens = inputLines[1].split(" ");
    const initialNumbers = numberTokens.map(Number);

    const occurrenceCounts = new Map();
    initialNumbers.forEach(currentValue => {
        occurrenceCounts.set(currentValue, (occurrenceCounts.get(currentValue) || 0) + 1);
    });

    const totalCombinations = Array.from(occurrenceCounts.values()).reduce((accumulator, count) => {
        return accumulator + (count * (count - 1)) / 2;
    }, 0);

    const outputResults = initialNumbers.map(elementValue => {
        const elementFrequency = occurrenceCounts.get(elementValue);
        return totalCombinations - elementFrequency + 1;
    });

    console.log(outputResults.join("\n"));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
