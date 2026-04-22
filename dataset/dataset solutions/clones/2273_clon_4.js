function processEvaluation(dataStream) {
    const numericComponents = dataStream.trim().split(/\s+/).map(component => parseInt(component, 10));

    const [firstOperand, secondOperand] = numericComponents;

    const multiplier = 1000 / 2;

    const resultCheck = (firstOperand * multiplier) >= secondOperand;

    const verdictMap = new Map([
        [true, "YES"],
        [false, "NO"]
    ]);

    console.log(verdictMap.get(resultCheck));
}

processEvaluation(require("node:fs").readFileSync("/dev/stdin", "utf8"));