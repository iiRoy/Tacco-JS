const getSourceData = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();

const parseStringLines = (text) => text.split('\n');
const extractNumericalRow = (line) => line.split(' ').map(Number);

const determineOutcome = (currentInventory, takeQuantity, upkeepThreshold, refillAmount, initialInventory, pastInventories) => {
    if (currentInventory < takeQuantity) {
        return false;
    }

    if (pastInventories.has(currentInventory)) {
        return true;
    }

    pastInventories.add(currentInventory);

    let remainingInventory = currentInventory % takeQuantity;

    if (remainingInventory <= upkeepThreshold) {
        remainingInventory += refillAmount;
    }

    if (remainingInventory === initialInventory) {
        return true;
    }
    
    return determineOutcome(remainingInventory, takeQuantity, upkeepThreshold, refillAmount, initialInventory, pastInventories);
};

const processCase = (caseLine) => {
    const [initialStock, buyAmount, criticalLevel, addAmount] = extractNumericalRow(caseLine);
    const visitedStates = new Set();
    return determineOutcome(initialStock, buyAmount, criticalLevel, addAmount, initialStock, visitedStates) ? "Yes" : "No";
};

const runAnalysis = (fullInputText) => {
    let allLines = parseStringLines(fullInputText);
    allLines.shift();

    const allResults = allLines.map(processCase);

    return allResults.join('\n');
};

const finalResult = runAnalysis(getSourceData());
console.log(finalResult);