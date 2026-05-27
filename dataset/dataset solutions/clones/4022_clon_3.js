function processInput(inputDataString) {
    const inputLines = inputDataString.split("\n");

    const productPrice = parseInt(inputLines[0], 10);
    const customerFunds = parseInt(inputLines[1], 10);

    const MODULO_THRESHOLD = 500;

    const priceRemainder = productPrice % MODULO_THRESHOLD;

    const isRemainderAffordable = priceRemainder <= customerFunds;

    const outputMessage = isRemainderAffordable ? "YES" : "NO";

    console.log(outputMessage);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
