function parseInputLineAsInt(lineContent) {
    return parseInt(lineContent, 10);
}

function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    const firstLineValue = inputLines[0];

    const numericInput = parseInputLineAsInt(firstLineValue);

    const intermediateCalculationResult = (numericInput + 1) / 2;

    const finalTruncatedValue = Math.trunc(intermediateCalculationResult);

    console.log(finalTruncatedValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
