function calculateParityOutcome(sourceMaterial) {
    const numericTokens = sourceMaterial.match(/-?\d+/g).map(Number);
    const countSpecification = numericTokens[0];
    const targetElements = numericTokens.slice(1, 1 + countSpecification);

    const oddNumberAccumulator = targetElements.reduce((currentSum, individualValue) => {
        return currentSum + (Math.abs(individualValue % 2) === 1 ? 1 : 0);
    }, 0);

    const finalDecisionMap = ["YES", "NO"];
    const resultIndex = oddNumberAccumulator % 2;

    console.log(finalDecisionMap[resultIndex]);
}

calculateParityOutcome(require("fs").readFileSync("/dev/stdin", "utf8").trim());