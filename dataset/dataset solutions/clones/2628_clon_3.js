function processInput(rawInputString) {
    const inputLines = rawInputString.split('\n');

    const firstLineTokens = inputLines[0].split(' ');
    const comparisonBoundary = 3200;

    const numericValueForComparison = Number(firstLineTokens[0]);

    let initialOutputData = inputLines[1].split(' ');

    const determineFinalOutput = (conditionSatisfied, originalContent) => {
        if (conditionSatisfied) {
            return originalContent;
        } else {
            return "red";
        }
    };

    const finalResult = determineFinalOutput(numericValueForComparison >= comparisonBoundary, initialOutputData);

    console.log(finalResult[0]);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
