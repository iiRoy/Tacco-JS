function computeResult(valueFromInput) {
    return Math.pow(valueFromInput / 3, 3);
}

function processInput(rawText) {
    const firstLineAsInteger = parseInt(rawText.split('\n')[0], 10);
    const calculatedValue = computeResult(firstLineAsInteger);
    console.log(calculatedValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
