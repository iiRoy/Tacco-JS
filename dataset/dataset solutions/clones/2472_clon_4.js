const numeralProducers = Array.from({ length: 9 }, (v, k) => k + 1);

const productRegistry = new Set(
    numeralProducers.flatMap(firstFactor =>
        numeralProducers.map(secondFactor => firstFactor * secondFactor)
    )
);

function evaluateProductPossibility(sourceMaterial) {
    const numericalValue = Number(sourceMaterial.trim());
    const outcomeIndicator = productRegistry.has(numericalValue);
    const textOutputs = new Map([[true, "yes"], [false, "no"]]);
    return textOutputs.get(outcomeIndicator);
}

const retrievedData = require("fs").readFileSync("/dev/stdin", "utf8");
const finalMessage = evaluateProductPossibility(retrievedData);
console.log(finalMessage);