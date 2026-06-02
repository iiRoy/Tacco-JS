function processNumericalInput(rawInputContent) {
    const numericValue = parseInt(rawInputContent.trim());
    const calculatedResult = (numericValue * numericValue - (numericValue % 2)) / 4;
    console.log(calculatedResult);
}

processNumericalInput(require("fs").readFileSync("/dev/stdin", "utf8"));
