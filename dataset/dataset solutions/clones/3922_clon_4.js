const processInput = (sourceString) => {
    const tokenPile = sourceString.split(/\s+/).filter(Boolean).map(Number);
    const totalQueries = tokenPile.shift();

    const computedResults = [];

    const handleNextQuery = (remainingCount) => {
        if (remainingCount === 0) {
            return;
        }
        const operandA = tokenPile.shift();
        const operandB = tokenPile.shift();
        computedResults.push(resolvePair(operandA, operandB));
        handleNextQuery(remainingCount - 1);
    };

    handleNextQuery(totalQueries);

    return computedResults.join('\n');
};

const resolvePair = (operandA, operandB) => {
    const evaluators = [
        [ (x, y) => x === y, (x, y) => (2 * x) - 2 ],
        [ (x, y) => Math.abs(x - y) === 1, (x, y) => (2 * ((x < y) ? x : y)) - 2 ],
        [ (x, y) => true, (x, y) => {
            const productVal = x * y;
            const rootKey = Math.floor(Math.sqrt(productVal - 1));
            const comparisonTerm = rootKey * (rootKey + 1);
            return (2 * rootKey) - ( (comparisonTerm >= productVal) ? 2 : 1 );
        }]
    ];

    const matchedEvaluator = evaluators.find(([predicate, _]) => predicate(operandA, operandB));
    return matchedEvaluator[1](operandA, operandB);
};

if (typeof window === "undefined") {
    console.log(processInput(require("fs").readFileSync("/dev/stdin", "utf8")));
}