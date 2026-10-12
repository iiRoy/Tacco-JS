function processInputAndDecide(rawContent) {
    const numericValues = rawContent.split(" ").map(val => parseInt(val, 10));
    const firstOperand = numericValues[0];
    const secondOperand = numericValues[1];

    const outcomeMessage = (secondOperand - (firstOperand * 500) <= 0) ? "YES" : "NO";

    console.log(outcomeMessage);
}

processInputAndDecide(require("fs").readFileSync("/dev/stdin", "utf8"));
