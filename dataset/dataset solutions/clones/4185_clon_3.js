const RADIX_DECIMAL = 10;

const parseNumericValue = (valueString) => {
    return parseInt(valueString, RADIX_DECIMAL);
};

function processInputData(rawData) {
    const inputLines = rawData.split('\n');
    const primaryInputLine = inputLines[0];

    const lineComponents = primaryInputLine.split(' ');

    const numItems = parseNumericValue(lineComponents[0]);
    const costPerItem = parseNumericValue(lineComponents[1]);
    const fixedCost = parseNumericValue(lineComponents[2]);

    const calculatedVariableCost = costPerItem * numItems;

    const finalOutputValue = Math.max(calculatedVariableCost, fixedCost);

    console.log('%d', finalOutputValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
