const MAX_ALLOWED_VALUE = 9;

function parseNumericValue(stringValue) {
    return Number.parseInt(stringValue);
}

function processInputData(rawInputContent) {
    const inputLines = rawInputContent.split("\n");
    const firstLineSegments = inputLines[0].split(" ");

    const numA = parseNumericValue(firstLineSegments[0]);
    const numB = parseNumericValue(firstLineSegments[1]);

    const areValuesWithinBounds = (numA <= MAX_ALLOWED_VALUE) && (numB <= MAX_ALLOWED_VALUE);

    let operationResult;

    if (areValuesWithinBounds) {
        operationResult = numA * numB;
    } else {
        operationResult = -1;
    }
    console.log(operationResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
