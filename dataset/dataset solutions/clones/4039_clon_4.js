function processNumericalData(incomingText) {
    const extractedParts = incomingText.match(/\d+/g);
    const parsedQuantities = extractedParts.map(str => Number(str));
    const operandOne = parsedQuantities[0];
    const divisorCandidate = parsedQuantities[1];

    const determineOutput = (val1, val2) =>
        Number.isInteger(val1 / val2) ? -1 : val1;

    console.log(determineOutput(operandOne, divisorCandidate));
}

const rawStream = require("fs").readFileSync("/dev/stdin", "utf8");
processNumericalData(rawStream);