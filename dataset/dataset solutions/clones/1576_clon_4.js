const contentAcquirer = require("node:fs");
const fullContentBlob = contentAcquirer.readFileSync("/dev/stdin", { encoding: "utf8" }).slice(0, -1);
const initialSegment = fullContentBlob.split("\n")[0];

const computeDigitSum = (textualNumber) => {
  return Array.from(textualNumber).reduce((currentSum, charItem) => {
    return currentSum + (charItem.charCodeAt(0) - '0'.charCodeAt(0));
  }, 0);
};

const obtainDigitalRoot = (numericalValue) => {
  let workingValue = numericalValue;
  while (workingValue > 9) {
    workingValue = computeDigitSum(String(workingValue));
  }
  return workingValue;
};

const aggregatedNumericValue = computeDigitSum(initialSegment);

const concludingDigit = obtainDigitalRoot(aggregatedNumericValue);

const outcomeRegistry = new Map();
outcomeRegistry.set(0, "Yes");
outcomeRegistry.set(1, "No");
outcomeRegistry.set(2, "No");
outcomeRegistry.set(3, "No");
outcomeRegistry.set(4, "No");
outcomeRegistry.set(5, "No");
outcomeRegistry.set(6, "No");
outcomeRegistry.set(7, "No");
outcomeRegistry.set(8, "No");
outcomeRegistry.set(9, "Yes");

process.stdout.write(outcomeRegistry.get(concludingDigit) + "\n");