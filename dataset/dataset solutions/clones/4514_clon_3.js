const MODULO_PRIME = 1000000007;

function retrieveInputData() {
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

function parseNumericInput(inputString) {
    const lines = inputString.split("\n");
    const numbersAsStrings = lines[0].split(" ");
    const firstValue = parseInt(numbersAsStrings[0], 10);
    const secondValue = parseInt(numbersAsStrings[1], 10);
    return { firstValue, secondValue };
}

function applyModuloOperation(value) {
    return value % MODULO_PRIME;
}

function calculateFactorialValue(inputNumber) {
    let currentProduct = 1;
    for (let loopCounter = 1; loopCounter <= inputNumber; loopCounter++) {
        currentProduct = (currentProduct % MODULO_PRIME) * (loopCounter % MODULO_PRIME);
    }
    return currentProduct;
}

function ProcessInput(rawInputData) {
    const { firstValue, secondValue } = parseNumericInput(rawInputData);

    const absoluteDifference = Math.abs(firstValue - secondValue);

    if (absoluteDifference >= 2) {
        console.log(0);
    } else if (absoluteDifference === 1) {
        const factorialResultA = calculateFactorialValue(firstValue);
        const factorialResultB = calculateFactorialValue(secondValue);

        const termA_mod = applyModuloOperation(factorialResultA);
        const termB_mod = applyModuloOperation(factorialResultB);
        const product_mod = applyModuloOperation(termA_mod * termB_mod);
        
        console.log(product_mod);
    } else if (absoluteDifference === 0) {
        const factorialResultA = calculateFactorialValue(firstValue);
        const factorialResultB = calculateFactorialValue(secondValue);

        const termA_mod = applyModuloOperation(factorialResultA);
        const termB_mod = applyModuloOperation(factorialResultB);
        const product_mod = applyModuloOperation(termA_mod * termB_mod);
        const doubledProduct = product_mod * 2;
        const finalOutput = applyModuloOperation(doubledProduct);

        console.log(finalOutput);
    }
}

ProcessInput(retrieveInputData());
