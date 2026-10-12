const moduloVal = 1000000007;

const calculateFactorialModulo = (limitValue, currentModulo) => {
    let factorialAccumulator = 1;
    for (let loopCounter = 1; loopCounter <= limitValue; loopCounter++) {
        factorialAccumulator = (factorialAccumulator * loopCounter) % currentModulo;
    }
    return factorialAccumulator;
};

function processInput(rawData) {
    const inputLines = rawData.split("\n");
    const numberTokens = inputLines[0].split(" ");
    const firstOperand = parseInt(numberTokens[0], 10);
    const secondOperand = parseInt(numberTokens[1], 10);

    let finalComputedResult = 0;

    const absoluteDifference = Math.abs(firstOperand - secondOperand);

    if (absoluteDifference === 0) {
        const factorialOfFirst = calculateFactorialModulo(firstOperand, moduloVal);
        const factorialOfSecond = calculateFactorialModulo(secondOperand, moduloVal);
        
        let productOfFactorials = (factorialOfFirst * factorialOfSecond) % moduloVal;
        finalComputedResult = (productOfFactorials * 2) % moduloVal;

    } else if (absoluteDifference === 1) {
        const factorialOfFirst = calculateFactorialModulo(firstOperand, moduloVal);
        const factorialOfSecond = calculateFactorialModulo(secondOperand, moduloVal);
        
        finalComputedResult = (factorialOfFirst * factorialOfSecond) % moduloVal;

    } else {
        // For absoluteDifference >= 2, finalComputedResult remains 0, as initialized.
    }
    
    console.log(finalComputedResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
