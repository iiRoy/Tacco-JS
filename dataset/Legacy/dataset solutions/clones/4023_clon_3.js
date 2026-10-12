function readStandardInput() {
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

function processInput(inputData) {
    const inputLines = inputData.split("\n");

    const productPrice = parseInt(inputLines[0], 10);
    const customerFunds = parseInt(inputLines[1], 10);

    const MODULO_VALUE = 500;

    const priceRemainder = productPrice % MODULO_VALUE;

    let decisionMessage;
    if (priceRemainder <= customerFunds) {
        decisionMessage = "YES";
    } else {
        decisionMessage = "NO";
    }

    console.log(decisionMessage);
}

processInput(readStandardInput());
