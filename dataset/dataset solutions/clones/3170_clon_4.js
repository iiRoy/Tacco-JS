const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
const rawText = inputSource.trim();
const lineArray = rawText.split("\n");

const countIdentifier = Number.parseInt(lineArray[0]);
const transactionEntries = lineArray.slice(1, countIdentifier + 1);

const currencyTransformers = new Map([
    ["JPY", (val) => Number.parseInt(val)],
    ["OTHER", (val) => Number.parseFloat(val) * 380000]
]);

const accumulatedValue = transactionEntries.reduce((currentSum, currentEntry) => {
    const entryParts = currentEntry.split(" ");
    const numericString = entryParts[0];
    const currencyDesignation = entryParts[1];

    const transformerFunction = currencyTransformers.get(currencyDesignation) || currencyTransformers.get("OTHER");

    return currentSum + transformerFunction(numericString);
}, 0);

console.log(accumulatedValue);