const comparisonOutcomes = new Map([
    [-1, "LESS"],
    [0, "EQUAL"],
    [1, "GREATER"]
]);

const determineRelativeSize = (valA, valB) => {
    return comparisonOutcomes.get(Math.sign(valA - valB));
};

const obtainNumericalComponents = (sourceText) => {
    const extractedStrings = sourceText.match(/-?\d+/g);
    if (!extractedStrings || extractedStrings.length < 2) {
        // Handle cases where there aren't enough numbers, consistent with original behavior for array access.
        // For this specific problem, we assume valid input from /dev/stdin will provide at least two numbers.
        return [0, 0]; // Default or error handling as appropriate for specific problem constraints.
    }
    return extractedStrings.slice(0, 2).map(str => parseInt(str, 10));
};

const executeEvaluation = (sourceIdentifier) => {
    const rawData = require("node:fs").readFileSync(sourceIdentifier, "utf8").trim();
    const [componentOne, componentTwo] = obtainNumericalComponents(rawData);
    const outcomeMessage = determineRelativeSize(componentOne, componentTwo);
    console.log(outcomeMessage);
};

executeEvaluation("/dev/stdin");