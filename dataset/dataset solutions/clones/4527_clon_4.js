function ProcessInput(sourceText) {
    const lineSegments = sourceText.split("\n");
    const relevantLine = lineSegments.slice(1, 2)[0];

    const stringTokens = relevantLine.split(" ");
    const numericalEntities = [];

    for (const token of stringTokens) {
        numericalEntities.push(Number(token));
    }

    const { highestValue, lowestValue } = numericalEntities.reduce((accumulator, currentNumber) => {
        accumulator.highestValue = Math.max(accumulator.highestValue, currentNumber);
        accumulator.lowestValue = Math.min(accumulator.lowestValue, currentNumber);
        return accumulator;
    }, { highestValue: -Infinity, lowestValue: Infinity });

    console.log(highestValue - lowestValue);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
