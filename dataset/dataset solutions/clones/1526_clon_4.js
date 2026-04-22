function calculateMaximumProduct(sourceTxt) {
    const rawValues = sourceTxt.match(/-?\d+(\.\d+)?/g).map(Number);

    const firstPairBounds = [
        Math.min(rawValues[0], rawValues[1]),
        Math.max(rawValues[0], rawValues[1])
    ];

    const secondPairBounds = [
        Math.min(rawValues[2], rawValues[3]),
        Math.max(rawValues[2], rawValues[3])
    ];

    const allOutcomes = firstPairBounds.flatMap(factorA =>
        secondPairBounds.map(factorB => factorA * factorB)
    );

    const finalAnswer = Math.max(...allOutcomes);

    return finalAnswer;
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(calculateMaximumProduct(fileContent));