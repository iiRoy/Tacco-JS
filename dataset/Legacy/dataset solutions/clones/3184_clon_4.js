function Main(input) {
    const numericTokens = input.split(" ").map(token => parseInt(token, 10));
    
    const operationRegistry = {
        true: (operandA, operandB) => operandA + operandB,
        false: (operandA, operandB) => operandA - operandB
    };
    
    const conditionMet = (numericTokens[1] % numericTokens[0] === 0);
    
    const finalCalculation = operationRegistry[conditionMet](numericTokens[1], numericTokens[0]);
    
    console.log(finalCalculation);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
