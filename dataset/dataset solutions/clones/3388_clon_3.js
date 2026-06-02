function processInputData(rawInputString) {
    const MODULO_DIVISOR = 2;
    let parsedNumbers = rawInputString.split("\n").map(Number);
    
    const numbersForCalculation = parsedNumbers.slice(1); 

    let finalParityResult = computeParitySum(numbersForCalculation);

    const outputMessage = (finalParityResult % MODULO_DIVISOR === 1) ? "first" : "second";
    console.log(outputMessage);
}

function computeParitySum(numbersToProcess) {
    let currentRunningParity = 0;
    const MODULO_CONSTANT = 2;

    for (const num of numbersToProcess) {
        currentRunningParity = (currentRunningParity + num) % MODULO_CONSTANT;
    }
    return currentRunningParity;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
