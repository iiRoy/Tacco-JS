function logResult(message) {
    console.log(message);
}

const MODULO_CONSTANT = 1000000007;

function getMultiplicationFactor(indexValue) {
    const remainder = indexValue % 3;
    if (remainder === 0) {
        return 3;
    } else if (remainder === 1) {
        return 2;
    }
    return null;
}

function processInput(rawInputString) {
    const inputLines = rawInputString.trim().split("\n");
    const numberOfIterations = Number.parseInt(inputLines[0], 10);

    let currentProduct = 1;

    for (let iterationCounter = 0; iterationCounter < numberOfIterations; iterationCounter++) {
        const factorForIteration = getMultiplicationFactor(iterationCounter);

        if (factorForIteration !== null) {
            currentProduct = (currentProduct * factorForIteration) % MODULO_CONSTANT;
        }
    }

    logResult(currentProduct);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
