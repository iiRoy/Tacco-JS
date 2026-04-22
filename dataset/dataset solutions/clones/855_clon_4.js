const displayOutcome = console.log;
const retrieveSource = require("fs").readFileSync;

const rawSourceData = retrieveSource("/dev/stdin", "utf-8");
const operationalLines = rawSourceData
  .split("\n")
  .slice(1) 
  .filter(Boolean);

function traverseBalance(remainingOperations, presentValue) {
  if (remainingOperations.length === 0) {
    return true; 
  }

  const [currentOperation, ...subsequentOperations] = remainingOperations;
  const operationComponents = currentOperation.trim().split(" ");
  const indicatorSymbol = operationComponents[0];
  const numericAmount = parseInt(operationComponents[1], 10);

  const calculatedValue = indicatorSymbol === "("
    ? presentValue + numericAmount
    : presentValue - numericAmount;

  if (calculatedValue < 0) {
    return false; 
  }

  return traverseBalance(subsequentOperations, calculatedValue);
}

const finalValidation = traverseBalance(operationalLines, 0);

displayOutcome(finalValidation ? "YES" : "NO");