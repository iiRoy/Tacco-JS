const acquireInput = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();
const emitOutput = (content) => console.log(content);

const inputTransformers = new Map([
    [0, (val) => val],
    [1, (val) => parseInt(val, 10)],
    [2, (val) => val.split(" ")],
    [3, (val) => val.split("\n")],
    [4, (val) => val.split(" ").map((s) => +s)],
    [5, (val) => val.split("\n").map((s) => +s)],
    [6, (val) => val.split("")],
    [7, (val) => val.split("").map((s) => +s)],
]);

const parseSegment = (segment, typeIdentifier) => {
    const transformer = inputTransformers.get(typeIdentifier);
    return transformer(segment);
};

const evaluateStockCycle = (currentStock, initialStockValue, purchaseQuantity, thresholdValue, replenishmentAmount, iterationCount, visitedStates) => {
    if (currentStock < purchaseQuantity) {
        return "No";
    }

    if (visitedStates.has(currentStock) || iterationCount >= 10000000) {
        return "Yes";
    }

    visitedStates.add(currentStock);

    let nextStockLevel = currentStock % purchaseQuantity;
    if (nextStockLevel <= thresholdValue) {
        nextStockLevel += replenishmentAmount;
    }

    return evaluateStockCycle(nextStockLevel, initialStockValue, purchaseQuantity, thresholdValue, replenishmentAmount, iterationCount + 1, visitedStates);
};

const executeSimulation = (rawInput) => {
    const allInputLines = parseSegment(rawInput, 3);
    const relevantDataLines = allInputLines.slice(1);

    const simulationResults = relevantDataLines.map((lineContent) => {
        const [initialStock, purchaseQuantity, thresholdValue, replenishmentAmount] = parseSegment(lineContent, 4);
        return evaluateStockCycle(initialStock, initialStock, purchaseQuantity, thresholdValue, replenishmentAmount, 0, new Set());
    });

    return simulationResults.join("\n");
};

emitOutput(executeSimulation(acquireInput()));
