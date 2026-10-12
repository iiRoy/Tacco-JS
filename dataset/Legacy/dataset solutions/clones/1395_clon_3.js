function processInputData(rawDataString) {
    const numericValues = rawDataString.split(" ").map(Number);

    const dividend = numericValues[0];
    const divisor = numericValues[1];

    const integerQuotient = Math.floor(dividend / divisor);

    const remainderValue = dividend % divisor;

    const precisionDigits = 6;
    const rawDivisionResult = dividend / divisor;
    const formattedDivisionResult = rawDivisionResult.toFixed(precisionDigits);

    console.log("%d %d %d", integerQuotient, remainderValue, formattedDivisionResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
